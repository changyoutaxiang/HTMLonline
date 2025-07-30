const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs-extra');

// 数据库路径 - 使用挂载硬盘或本地存储
const dbPath = process.env.ZEABUR_MOUNT_PATH ? 
    path.join(process.env.ZEABUR_MOUNT_PATH, 'database.sqlite') :
    path.join(__dirname, '..', 'database.sqlite');

// 添加备用数据库路径，确保向后兼容
const backupDbPath = path.join(__dirname, 'database.sqlite');

// 确保数据库目录存在
fs.ensureDirSync(path.dirname(dbPath));
fs.ensureDirSync(path.dirname(backupDbPath));

// 创建Sequelize实例
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// 备用数据库连接（用于数据恢复）
const backupSequelize = new Sequelize({
    dialect: 'sqlite',
    storage: backupDbPath,
    logging: false
});

// 定义文件模型
const File = sequelize.define('File', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    uploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    accessCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastAccessed: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'files',
    timestamps: true
});

// 初始化数据库
async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
        
        // 同步数据库模型
        await File.sync({ force: false });
        console.log('数据库表同步完成');
        
        // 检查是否需要数据迁移
        await checkAndMigrateData();
        
    } catch (error) {
        console.error('数据库初始化失败:', error);
        process.exit(1);
    }
}

// 数据迁移和恢复功能
async function checkAndMigrateData() {
    try {
        // 检查备用数据库是否存在且有数据
        const backupFile = backupSequelize.define('File', {
            id: { type: DataTypes.STRING, primaryKey: true },
            originalName: { type: DataTypes.STRING, allowNull: false },
            filename: { type: DataTypes.STRING, allowNull: false, unique: true },
            size: { type: DataTypes.INTEGER, allowNull: false },
            mimeType: { type: DataTypes.STRING, allowNull: false },
            uploadDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            accessCount: { type: DataTypes.INTEGER, defaultValue: 0 },
            lastAccessed: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
        }, { tableName: 'files', timestamps: true });

        await backupFile.sync({ force: false });
        
        const mainCount = await File.count();
        const backupCount = await backupFile.count();
        
        // 如果主数据库为空但备用数据库有数据，进行迁移
        if (mainCount === 0 && backupCount > 0) {
            console.log('检测到备用数据库有数据，开始迁移...');
            const backupFiles = await backupFile.findAll();
            
            for (const backupFileRecord of backupFiles) {
                await File.create(backupFileRecord.toJSON());
            }
            
            console.log(`成功迁移 ${backupFiles.length} 条文件记录`);
        }
        
        // 修复现有文件：将随机文件名转换为哈希文件名
        await migrateRandomFilesToHashFiles();
        
    } catch (error) {
        console.log('数据迁移检查失败（可能是正常的）:', error.message);
    }
}

// 将现有的随机文件名转换为哈希文件名
async function migrateRandomFilesToHashFiles() {
    const crypto = require('crypto');
    const path = require('path');
    
    try {
        // 获取所有文件记录，然后筛选出随机文件名（16个十六进制字符）
        const allFiles = await File.findAll();
        const randomFiles = allFiles.filter(file => {
            const filename = file.filename;
            // 检查是否是16个十六进制字符 + .html 的格式
            return /^[a-f0-9]{16}\.html$/.test(filename);
        });
        
        if (randomFiles.length === 0) {
            console.log('没有需要迁移的随机文件名文件');
            return;
        }
        
        console.log(`找到 ${randomFiles.length} 个需要迁移的随机文件名文件`);
        
        // 确定存储路径 - 与server.js保持一致
        const uploadsDir = process.env.ZEABUR_MOUNT_PATH ? 
            path.join(process.env.ZEABUR_MOUNT_PATH, 'uploads') :
            path.join(__dirname, '..', 'uploads');
        
        const backupUploadsDir = path.join(__dirname, '..', 'uploads');
        
        // 确保目录存在
        const fs = require('fs-extra');
        fs.ensureDirSync(uploadsDir);
        fs.ensureDirSync(backupUploadsDir);
        
        for (const fileRecord of randomFiles) {
            try {
                // 查找文件的实际位置
                const possiblePaths = [
                    path.join(uploadsDir, fileRecord.filename),
                    path.join(backupUploadsDir, fileRecord.filename)
                ];
                
                let oldFilePath = null;
                for (const testPath of possiblePaths) {
                    if (fs.existsSync(testPath)) {
                        oldFilePath = testPath;
                        break;
                    }
                }
                
                if (!oldFilePath) {
                    console.log(`文件不存在，跳过: ${fileRecord.filename}`);
                    continue;
                }
                
                // 读取文件内容并生成哈希
                const fileContent = fs.readFileSync(oldFilePath);
                const hash = crypto.createHash('md5').update(fileContent).digest('hex');
                const ext = path.extname(fileRecord.filename);
                const newFilename = `${hash}${ext}`;
                const newFilePath = path.join(uploadsDir, newFilename);
                
                // 检查是否已存在相同哈希的文件
                const existingHashFile = await File.findOne({ 
                    where: { filename: newFilename } 
                });
                
                if (existingHashFile) {
                    // 如果已存在相同内容的文件，删除旧文件和记录
                    console.log(`删除重复文件: ${fileRecord.filename} -> 已存在 ${newFilename}`);
                    fs.unlinkSync(oldFilePath);
                    await fileRecord.destroy();
                } else {
                    // 重命名文件和更新数据库记录
                    fs.renameSync(oldFilePath, newFilePath);
                    await fileRecord.update({ filename: newFilename });
                    console.log(`迁移完成: ${fileRecord.filename} -> ${newFilename}`);
                }
                
            } catch (error) {
                console.error(`迁移文件失败 ${fileRecord.filename}:`, error.message);
            }
        }
        
        console.log('随机文件名迁移完成');
        
    } catch (error) {
        console.error('随机文件名迁移失败:', error.message);
    }
}

module.exports = {
    sequelize,
    File,
    initializeDatabase,
    checkAndMigrateData
};