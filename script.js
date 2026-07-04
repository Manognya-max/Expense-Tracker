//Get Elements
const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const balance = document.getElementById("balance");

const budgetLimit = document.getElementById("budgetLimit");
const setBudget = document.getElementById("setBudget");
const budgetMessage = document.getElementById("budgetMessage");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = Number(localStorage.getItem("budget")) || 0;

// Charts
let expenseChart;
let summaryChart;

// Add Transaction
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;

    const transaction = {
        id: Date.now(),
        type,
        amount,
        category,
        description
    };

    transactions.push(transaction);

    saveData();

    form.reset();

    updateUI();
});

// Save Budget
setBudget.addEventListener("click", function () {

    budget = Number(budgetLimit.value);

    localStorage.setItem("budget", budget);

    updateUI();

});

// Save Local Storage
function saveData() {

    localStorage.setItem("transactions", JSON.stringify(transactions));

}

// Update UI
function updateUI() {

    transactionList.innerHTML = "";

    let income = 0;
    let expense = 0;

    let categoryTotals = {};

    transactions.forEach((t) => {

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${t.type}</td>
        <td>${t.category}</td>
        <td>${t.description}</td>
        <td>₹${t.amount}</td>
        <td>
            <button onclick="deleteTransaction(${t.id})">
            Delete
            </button>
        </td>
        `;

        transactionList.appendChild(row);

        if (t.type === "income") {

            income += t.amount;

        } else {

            expense += t.amount;

            if (categoryTotals[t.category]) {

                categoryTotals[t.category] += t.amount;

            } else {

                categoryTotals[t.category] = t.amount;

            }

        }

    });

    totalIncome.textContent = "₹" + income;
    totalExpense.textContent = "₹" + expense;
    balance.textContent = "₹" + (income - expense);

    // Budget Alert

    if (budget > 0) {

        if (expense > budget) {

            budgetMessage.innerHTML =
                "<span style='color:red;'>⚠ Budget Exceeded!</span>";

        } else {

            budgetMessage.innerHTML =
                "<span style='color:green;'>Budget Remaining: ₹" +
                (budget - expense) +
                "</span>";

        }

    }

    drawExpenseChart(categoryTotals);

    drawSummaryChart(income, expense);

}

// Delete Transaction
function deleteTransaction(id) {

    transactions = transactions.filter((t) => t.id !== id);

    saveData();

    updateUI();

}

// Expense Pie Chart
function drawExpenseChart(categoryTotals) {

    const labels = Object.keys(categoryTotals);

    const values = Object.values(categoryTotals);

    if (expenseChart) {

        expenseChart.destroy();

    }

    expenseChart = new Chart(document.getElementById("expenseChart"), {

        type: "pie",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: [
                    "#ff6384",
                    "#36a2eb",
                    "#ffce56",
                    "#4caf50",
                    "#ff9800",
                    "#9c27b0",
                    "#009688"
                ]

            }]

        }

    });

}

// Income vs Expense Chart
function drawSummaryChart(income, expense) {

    if (summaryChart) {

        summaryChart.destroy();

    }

    summaryChart = new Chart(document.getElementById("summaryChart"), {

        type: "bar",

        data: {

            labels: ["Income", "Expense"],

            datasets: [{

                label: "Amount",

                data: [income, expense],

                backgroundColor: [

                    "green",

                    "red"

                ]

            }]

        },

        options: {

            responsive: true,

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}

// Initial Load
updateUI();