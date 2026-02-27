// --- 存钱罐数据管理模块 (js/modules/piggy_bank_data.js) ---

// 初始化存钱罐数据
function initPiggyBankData() {
    if (!db.piggyBank) {
        db.piggyBank = {
            balance: 0, // 当前余额
            transactions: [], // 交易记录
            billSettings: {
                dailyEnabled: false,
                monthlyEnabled: false,
                dailyRecipients: [], // [{chatId, chatType}]
                monthlyRecipients: [] // [{chatId, chatType}]
            }
        };
    }
}

// 获取余额
function getPiggyBankBalance() {
    initPiggyBankData();
    return db.piggyBank.balance || 0;
}

// 添加交易记录
async function addPiggyBankTransaction(transaction) {
    initPiggyBankData();
    
    const newTransaction = {
        id: 'tran_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: transaction.type, // 'income' 收入, 'expense' 支出
        amount: parseFloat(transaction.amount) || 0,
        category: transaction.category || '', // 'manual' 手动, 'transfer' 转账, 'shop' 商城, 'chat_receive' 聊天收款
        description: transaction.description || '',
        relatedChatId: transaction.relatedChatId || null,
        relatedChatType: transaction.relatedChatType || null,
        timestamp: transaction.timestamp || Date.now(),
        createdAt: Date.now()
    };
    
    // 更新余额
    if (newTransaction.type === 'income') {
        db.piggyBank.balance = (db.piggyBank.balance || 0) + newTransaction.amount;
    } else if (newTransaction.type === 'expense') {
        db.piggyBank.balance = Math.max(0, (db.piggyBank.balance || 0) - newTransaction.amount);
    }
    
    db.piggyBank.transactions.unshift(newTransaction); // 最新的在前面
    
    await saveData();
    return newTransaction;
}

// 删除交易记录
async function deletePiggyBankTransaction(transactionId) {
    initPiggyBankData();
    
    const transaction = db.piggyBank.transactions.find(t => t.id === transactionId);
    if (!transaction) return false;
    
    // 恢复余额
    if (transaction.type === 'income') {
        db.piggyBank.balance = Math.max(0, (db.piggyBank.balance || 0) - transaction.amount);
    } else if (transaction.type === 'expense') {
        db.piggyBank.balance = (db.piggyBank.balance || 0) + transaction.amount;
    }
    
    // 删除记录
    const index = db.piggyBank.transactions.findIndex(t => t.id === transactionId);
    if (index > -1) {
        db.piggyBank.transactions.splice(index, 1);
    }
    
    await saveData();
    return true;
}

// 获取交易记录
function getPiggyBankTransactions(filter = {}) {
    initPiggyBankData();
    let transactions = [...db.piggyBank.transactions];
    
    // 按类型过滤
    if (filter.type) {
        transactions = transactions.filter(t => t.type === filter.type);
    }
    
    // 按分类过滤
    if (filter.category) {
        transactions = transactions.filter(t => t.category === filter.category);
    }
    
    // 按日期范围过滤
    if (filter.startDate) {
        transactions = transactions.filter(t => t.timestamp >= filter.startDate);
    }
    if (filter.endDate) {
        transactions = transactions.filter(t => t.timestamp <= filter.endDate);
    }
    
    return transactions;
}

// 获取指定日期的交易
function getTransactionsByDate(year, month, day) {
    initPiggyBankData();
    const start = new Date(year, month - 1, day).getTime();
    const end = start + 24 * 60 * 60 * 1000 - 1;
    return db.piggyBank.transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
}

// 获取指定月份的交易
function getTransactionsByMonth(year, month) {
    initPiggyBankData();
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();
    return db.piggyBank.transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
}

// 检查余额是否足够支付
function checkPiggyBankBalance(amount) {
    initPiggyBankData();
    return (db.piggyBank.balance || 0) >= parseFloat(amount);
}

// 扣除余额（用于商城支付或转账）
async function deductPiggyBankBalance(amount, description, relatedChatId = null, relatedChatType = null, category = 'shop') {
    initPiggyBankData();
    const amountNum = parseFloat(amount);
    
    if (!checkPiggyBankBalance(amountNum)) {
        return false; // 余额不足
    }
    
    await addPiggyBankTransaction({
        type: 'expense',
        amount: amountNum,
        category: category, // 'shop' 或 'transfer'
        description: description,
        relatedChatId: relatedChatId,
        relatedChatType: relatedChatType
    });
    
    return true;
}

// 保存账单设置
async function savePiggyBankBillSettings(settings) {
    initPiggyBankData();
    db.piggyBank.billSettings = { ...db.piggyBank.billSettings, ...settings };
    await saveData();
}

// 获取账单设置
function getPiggyBankBillSettings() {
    initPiggyBankData();
    return db.piggyBank.billSettings || {
        dailyEnabled: false,
        monthlyEnabled: false,
        dailyRecipients: [],
        monthlyRecipients: []
    };
}
