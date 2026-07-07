// ======================
// Expense Tracker
// ======================

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

// Load data when page opens
window.onload = function () {
    displayTransactions();
    updateSummary();
    updateCharts();
};

// Add Transaction
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    if (amount <= 0 || isNaN(amount)) {
        alert("Enter a valid amount.");
        return;
    }

    const transaction = {
        id: Date.now(),
        type,
        amount,
        category,
        description
    };

    transactions.push(transaction);

    saveData();

    displayTransactions();
    updateSummary();
    updateCharts();

    form.reset();
});

// Display Transactions
function displayTransactions() {

    transactionList.innerHTML = "";

    transactions.forEach((transaction) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${transaction.type}</td>
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td>₹${transaction.amount}</td>
            <td>
                <button onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>
            </td>
        `;

        transactionList.appendChild(row);

    });

}

// Delete Transaction
function deleteTransaction(id){

    transactions = transactions.filter(item => item.id !== id);

    saveData();

    displayTransactions();
    updateSummary();
    updateCharts();

}

// Update Summary
function updateSummary(){

    let income = 0;
    let expense = 0;

    transactions.forEach(item=>{

        if(item.type==="income"){
            income += item.amount;
        }
        else{
            expense += item.amount;
        }

    });

    totalIncome.innerText = "₹" + income;

    totalExpense.innerText = "₹" + expense;

    balance.innerText = "₹" + (income-expense);

}

// Save Local Storage
function saveData(){

    localStorage.setItem("transactions",JSON.stringify(transactions));

}
let budget = localStorage.getItem("budget") || 0;

const budgetInput = document.getElementById("budgetLimit");
const budgetMessage = document.getElementById("budgetMessage");
const setBudgetBtn = document.getElementById("setBudget");

setBudgetBtn.addEventListener("click", () => {

    budget = Number(budgetInput.value);

    if (budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    localStorage.setItem("budget", budget);

    budgetInput.value = "";

    checkBudget();

});
function checkBudget() {

    let totalExpenseValue = 0;

    transactions.forEach(item => {

        if (item.type === "expense") {
            totalExpenseValue += item.amount;
        }

    });

    if (budget == 0) {
        budgetMessage.innerHTML = "";
        return;
    }

    if (totalExpenseValue > budget) {

        budgetMessage.innerHTML = "🚨 Budget Exceeded!";
        budgetMessage.style.color = "red";

    }

    else {

        budgetMessage.innerHTML =
            "✅ Remaining Budget : ₹" + (budget - totalExpenseValue);

        budgetMessage.style.color = "green";

    }

}
checkBudget();

function drawPieChart(canvas, data) {

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 25;

    ctx.clearRect(0, 0, width, height);

    const labels = Object.keys(data);
    const values = Object.values(data);
    const total = values.reduce((sum, value) => sum + value, 0);

    if (!labels.length || total === 0) {

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#dfe6e9";
        ctx.lineWidth = 18;
        ctx.stroke();

        ctx.fillStyle = "#666";
        ctx.font = "16px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No expense data", centerX, centerY + 8);

        return;

    }

    const colors = ["#4CAF50", "#00b894", "#3498db", "#e74c3c", "#f39c12", "#9b59b6", "#1abc9c", "#34495e", "#ff6b6b"];
    let startAngle = -Math.PI / 2;

    values.forEach((value, index) => {

        const sliceAngle = (value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();

        startAngle += sliceAngle;

    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    ctx.fillStyle = "#666";
    ctx.font = "16px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Expense by category", centerX, height - 12);

}

function drawBarChart(canvas, income, expense) {

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return;
    }

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(income, expense, 1);
    const chartHeight = height - 70;
    const barWidth = width / 6;
    const gap = width / 12;

    const drawBar = (x, value, label, color) => {

        const barHeight = (value / maxValue) * (chartHeight - 25);
        const y = height - 30 - barHeight;

        ctx.fillStyle = color;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#333";
        ctx.font = "14px Poppins, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x + barWidth / 2, height - 10);
        ctx.fillText(`₹${value}`, x + barWidth / 2, y - 8);

    };

    drawBar(gap, income, "Income", "#2ecc71");
    drawBar(width / 2 + gap / 2, expense, "Expense", "#e74c3c");

    ctx.strokeStyle = "#ddd";
    ctx.beginPath();
    ctx.moveTo(20, height - 30);
    ctx.lineTo(width - 20, height - 30);
    ctx.stroke();

}

function updateCharts() {

    const expenseCanvas = document.getElementById("expenseChart");
    const summaryCanvas = document.getElementById("summaryChart");

    if (!expenseCanvas || !summaryCanvas) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    const expenseWidth = expenseCanvas.clientWidth || 320;
    const expenseHeight = expenseCanvas.clientHeight || 320;
    const summaryWidth = summaryCanvas.clientWidth || 320;
    const summaryHeight = summaryCanvas.clientHeight || 320;

    expenseCanvas.width = expenseWidth * dpr;
    expenseCanvas.height = expenseHeight * dpr;
    summaryCanvas.width = summaryWidth * dpr;
    summaryCanvas.height = summaryHeight * dpr;

    const expenseCtx = expenseCanvas.getContext("2d");
    const summaryCtx = summaryCanvas.getContext("2d");

    if (expenseCtx) {
        expenseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (summaryCtx) {
        summaryCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const expenseData = {};
    let income = 0;
    let expense = 0;

    transactions.forEach(item => {

        if (item.type === "expense") {

            expense += item.amount;
            expenseData[item.category] = (expenseData[item.category] || 0) + item.amount;

        }

        else {

            income += item.amount;

        }

    });

    drawPieChart(expenseCanvas, expenseData);
    drawBarChart(summaryCanvas, income, expense);

}
budgetInput.value = budget;

checkBudget();

updateCharts();