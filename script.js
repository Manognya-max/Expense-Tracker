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

let expenseChart;
let summaryChart;
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

function updateCharts() {

    const expenseCtx = document.getElementById("expenseChart");
    const summaryCtx = document.getElementById("summaryChart");

    if (!expenseCtx || !summaryCtx) {
        return;
    }

    const expenseData = {};

    let income = 0;
    let expense = 0;

    transactions.forEach(item => {

        if (item.type === "expense") {

            expense += item.amount;

            expenseData[item.category] =
                (expenseData[item.category] || 0) + item.amount;

        }

        else {

            income += item.amount;

        }

    });

    if (expenseChart) {

        expenseChart.destroy();

    }

    if (summaryChart) {

        summaryChart.destroy();

    }

    expenseChart = new Chart(expenseCtx, {

        type: "pie",

        data: {

            labels: Object.keys(expenseData),

            datasets: [{

                data: Object.values(expenseData)

            }]

        }

    });

    summaryChart = new Chart(summaryCtx, {

        type: "bar",

        data: {

            labels: ["Income", "Expense"],

            datasets: [{

                label: "Amount",

                data: [income, expense]

            }]

        }

    });

}
budgetInput.value = budget;

checkBudget();

updateCharts();