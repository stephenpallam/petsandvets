# Production Data Management System

## 🎯 Overview
This system ensures complete separation between production and test data, with automatic backup/restore capabilities and protection against test data contamination.

## 🏗️ Architecture

### Production Database
- **Name**: `animal_hospital_db` 
- **Purpose**: Single source of truth for all production data
- **Protection**: Fully isolated from test scripts
- **Backup**: Automatic every 6 hours

### Test Database  
- **Name**: `animal_hospital_db_test`
- **Purpose**: Isolated testing environment
- **Lifecycle**: Created fresh for each test run, then destroyed
- **Safety**: Cannot contaminate production data

## 🔧 Components

### 1. ProductionDataManager (`/app/backend/data_manager.py`)
- **Backup**: Creates complete snapshots of production data
- **Restore**: Restores data from backups on startup
- **Cleanup**: Removes test data contamination
- **Collections**: `business_info`, `users`, `hospital_hours`, `urgent_care_hours`, `reviews`, `ai_settings`, `email_config`

### 2. TestDatabaseManager (`/app/backend/test_db_config.py`) 
- **Isolation**: Forces all tests to use separate test database
- **Setup**: Creates clean test environment
- **Cleanup**: Destroys test data after completion

### 3. Startup Manager (`/app/startup_data_manager.py`)
- **Clean Start**: Ensures clean data on pod restart
- **Restore**: Automatically restores from latest backup
- **Protection**: Removes any test data contamination

### 4. Auto Backup Service (`/app/backend/auto_backup.py`)
- **Frequency**: Every 6 hours (configurable)
- **Retention**: Keeps last 10 backups
- **Location**: `/app/data/backups/`

## 🚀 Usage

### Manual Backup
```bash
cd /app && python3 backend/data_manager.py backup
```

### Manual Restore
```bash  
cd /app && python3 backend/data_manager.py restore [backup_file]
```

### Clean Test Data
```bash
cd /app && python3 backend/data_manager.py clean
```

### Safe Test Execution
```bash
cd /app && python3 test_wrapper.py business_info_test.py
```

### Check Data Status
```bash
cd /app && python3 backend/db_monitor.py
```

## 🔒 Data Protection

### Test Script Safety
- ✅ All test scripts use `animal_hospital_db_test` 
- ✅ Production database `animal_hospital_db` is never touched by tests
- ✅ Test data automatically cleaned up after execution
- ✅ Test environment variables isolated

### Startup Protection  
- ✅ Automatic test data cleanup on startup
- ✅ Restore from backup if data corruption detected
- ✅ Clean defaults if no backup available
- ✅ Never run test scripts on production startup

### Backup System
- ✅ Automatic backups every 6 hours
- ✅ Manual backup capability
- ✅ Backup verification and restoration
- ✅ Old backup cleanup (keeps 10 most recent)

## 📁 File Structure
```
/app/
├── backend/
│   ├── data_manager.py          # Production data management
│   ├── test_db_config.py        # Test database isolation
│   ├── auto_backup.py           # Automatic backup service
│   └── db_monitor.py            # Database monitoring
├── data/
│   └── backups/                 # Backup storage location
├── startup_data_manager.py      # Startup data management
├── test_wrapper.py              # Safe test execution
└── DATA_MANAGEMENT_README.md    # This file
```

## 🎛️ Configuration

### Environment Variables
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Production database name (default: `animal_hospital_db`)

### Backup Settings (in `auto_backup.py`)
- `backup_interval_hours`: Backup frequency (default: 6 hours)
- `keep_count`: Number of backups to retain (default: 10)

## 🔍 Monitoring

### Database Monitor
The `db_monitor.py` script provides real-time database status:
- Business info verification
- Test data detection warnings
- Record counts
- Data integrity checks

### Backup Status
Check backup directory for latest snapshots:
```bash
ls -la /app/data/backups/
```

## 🚨 Troubleshooting

### If Test Data Appears in Production
```bash
cd /app && python3 backend/data_manager.py clean
cd /app && python3 startup_data_manager.py
```

### If Data is Lost
```bash
cd /app && python3 backend/data_manager.py restore
```

### If Tests Contaminate Production
1. Check test script imports for `set_test_environment()`
2. Verify `DB_NAME` environment variable during tests
3. Use `test_wrapper.py` for safe test execution

## 🎉 Benefits

1. **Data Safety**: Production data completely protected from test contamination
2. **Automatic Recovery**: System restores from backups on startup issues  
3. **Single Source of Truth**: Only `animal_hospital_db` contains real data
4. **Test Isolation**: Tests run in completely separate environment
5. **Zero Data Loss**: Automatic backups ensure data persistence
6. **Easy Migration**: Pod restarts automatically restore data from backups

## 📞 Support

If you encounter any issues with the data management system:
1. Check logs in `/var/log/supervisor/backend.*.log`
2. Run `python3 backend/db_monitor.py` to check database status
3. Use `python3 startup_data_manager.py` to manually fix data issues
4. All test scripts now use isolated test database automatically