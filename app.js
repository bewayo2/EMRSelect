document.addEventListener('DOMContentLoaded', function () {
    const allCriteria = [
        "Record management efficiency", "Order entry facilitation", "Decision support integration",
        "Customizable reporting capabilities", "Intuitive user interface", "Multi-device accessibility",
        "Minimal training requirements", "Workflow-specific customization", "Seamless data exchange",
        "Broad system integration", "Compliance with standards", "Robust data protection",
        "Controlled access authorization", "Comprehensive audit trails", "Regulatory compliance adherence",
        "Reliable vendor support", "Frequent software updates", "System scalability support",
        "Initial purchasing costs", "Ongoing operational expenses", "Positive financial return",
        "Fast system response", "Minimal operational downtime", "Effective data backup",
        "Practice management tools", "Raw data access"
    ];

    const availableCriteria = document.getElementById('availableCriteria');
    const selectedCriteria = document.getElementById('selectedCriteria');

    allCriteria.forEach(function (criterion) {
        const li = document.createElement('li');
        li.textContent = criterion;
        availableCriteria.appendChild(li);
    });

    const sortableAvailable = new Sortable(availableCriteria, {
        group: {
            name: 'criteria',
            pull: 'clone',
            put: true // Allow items to be put back in the available list
        },
        animation: 150,
        sort: false
    });

    const sortableSelected = new Sortable(selectedCriteria, {
        group: {
            name: 'criteria',
            put: true
        },
        animation: 150,
        onAdd: function (evt) {
            const addedItem = evt.item;
            const selectedItems = Array.from(selectedCriteria.children).map(item => item.textContent);

            if (selectedItems.filter(item => item === addedItem.textContent).length > 1) {
                selectedCriteria.removeChild(addedItem);
                showError("This criterion has already been added.");
            } else if (selectedCriteria.children.length > 10) {
                selectedCriteria.removeChild(addedItem);
                showError("You can only select up to 10 criteria. You can replace a criteria by dragging the unwanted one back to the Available Criteria list and drag the new one across");
            } else {
                hideError();
                const criterionText = addedItem.textContent;
                const availableItem = Array.from(availableCriteria.children).find(item => item.textContent === criterionText);
                if (availableItem) {
                    availableCriteria.removeChild(availableItem);
                }
                updateScoringInputs();
            }
        },
        onRemove: function (evt) {
            const removedItem = evt.item;
            const criterionText = removedItem.textContent;
            if (!Array.from(availableCriteria.children).some(item => item.textContent === criterionText)) {
                const li = document.createElement('li');
                li.textContent = criterionText;
                availableCriteria.appendChild(li);
            }
            updateScoringInputs();
        },
        onSort: function () {
            updateScoringInputs();
        }
    });

    document.getElementById('addProductBtn').addEventListener('click', function () {
        addProduct();
    });

    function addProduct() {
        const productName = document.getElementById('newProductName').value.trim() || `Product ${document.querySelectorAll('#products .product').length + 1}`;
        if (Array.from(document.querySelectorAll('#products .product h2')).some(el => el.textContent === productName)) {
            alert("Product already exists. Update the existing product or enter a different name.");
            return; // Stop execution if the product exists
        }

        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        const productTitle = document.createElement('h2');
        productTitle.textContent = productName;
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score-inputs';
        const calculateBtn = document.createElement('button');
        calculateBtn.textContent = 'Calculate Total Score';
        calculateBtn.addEventListener('click', function () {
            calculateTotalScore(productName, productDiv);
        });

        productDiv.appendChild(productTitle);
        productDiv.appendChild(scoreDiv);
        productDiv.appendChild(calculateBtn);
        document.getElementById('products').appendChild(productDiv);
        document.getElementById('newProductName').value = '';

        updateScoringInputs();
    }

    function updateScoringInputs() {
        const selectedItems = Array.from(selectedCriteria.children).map(item => item.textContent);
        document.querySelectorAll('#products .score-inputs').forEach(function (scoreDiv) {
            const productDiv = scoreDiv.closest('.product');
            const productName = productDiv.querySelector('h2').textContent;

            selectedItems.forEach(function (criterion) {
                const criterionId = `${productName.replace(/ /g, '-')}-${criterion.replace(/ /g, '-').toLowerCase()}`;
                let inputElement = document.getElementById(`score-${criterionId}`);
                if (!inputElement) {
                    inputElement = document.createElement('input');
                    inputElement.type = 'range';
                    inputElement.min = '0';
                    inputElement.max = '3';
                    inputElement.value = '0';
                    inputElement.id = `score-${criterionId}`;
                    inputElement.oninput = function () {
                        updateDisplayScore(criterionId, inputElement.value);
                    };
                    const labelElement = document.createElement('label');
                    labelElement.htmlFor = `score-${criterionId}`;
                    labelElement.textContent = criterion;
                    const spanElement = document.createElement('span');
                    spanElement.id = `scoreValue-${criterionId}`;
                    spanElement.textContent = '0';
                    const divElement = document.createElement('div');
                    divElement.appendChild(labelElement);
                    divElement.appendChild(inputElement);
                    divElement.appendChild(spanElement);
                    scoreDiv.appendChild(divElement);
                }
            });
        });
    }

    window.updateDisplayScore = function (criterionId, value) {
        document.getElementById(`scoreValue-${criterionId}`).textContent = value;
    };

    function calculateTotalScore(productName, productDiv) {
        const weights = [18, 16, 14, 12, 10, 8, 7, 6, 5, 4];
        let totalScore = 0;

        productDiv.querySelectorAll('.score-inputs div').forEach(function (div, index) {
            const score = parseInt(div.querySelector('input[type="range"]').value, 10);
            if (!isNaN(score)) {
                totalScore += (score / 3 * 100) * (weights[index] / 100);
            }
        });

        // Update or Add new score to the table
        let scoreRow = Array.from(document.querySelectorAll(`#scoreTable tbody tr`)).find(row => row.children[0].textContent === productName);
        if (scoreRow) {
            scoreRow.querySelector('td:nth-child(2)').textContent = totalScore.toFixed(2);
        } else {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `<td>${productName}</td><td>${totalScore.toFixed(2)}</td>`;
            document.querySelector('#scoreTable tbody').appendChild(newRow);
        }
        sortScoreTable();
    }

    function sortScoreTable() {
        const rows = Array.from(document.querySelectorAll('#scoreTable tbody tr'));
        rows.sort(function (a, b) {
            const keyA = parseFloat(a.children[1].textContent);
            const keyB = parseFloat(b.children[1].textContent);
            return keyB - keyA;
        });
        const tbody = document.querySelector('#scoreTable tbody');
        rows.forEach(function (row) {
            tbody.appendChild(row);
        });
    }

    function showError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'none';
    }
});
