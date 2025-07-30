const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs-extra');

// 数据库路径 - 使用挂载硬盘或本地存储
const dbPath = process.env.ZEABUR_MOUNT_PATH ? 
    path.join(process.env.ZEABUR_MOUNT_PATH, 'database.sqlite') :
    path.join(__dirname, 'database.sqlite');

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
        
    } catch (error) {
        console.log('数据迁移检查失败（可能是正常的）:', error.message);
    }
}

module.exports = {
    sequelize,
    File,
    initializeDatabase,
    checkAndMigrateData
};