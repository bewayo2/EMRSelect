$(document).ready(function () {
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

    allCriteria.forEach(function (criterion) {
        $('#availableCriteria').append(`<li>${criterion}</li>`);
    });

    $("#availableCriteria, #selectedCriteria").sortable({
        connectWith: ".criteria-list",
        placeholder: "ui-state-highlight",
        receive: function (event, ui) {
            if ($("#selectedCriteria li").length > 10) {
                $(ui.sender).sortable('cancel');
                showError("You can only select up to 10 criteria.");
            } else {
                hideError();
            }
        }
    }).disableSelection();

    $('#addProductBtn').click(function () {
        addProduct();
    });

    function addProduct() {
        const productName = $('#newProductName').val().trim() || `Product ${$('#products .product').length + 1}`;
        if ($(`#products .product h2:contains('${productName}')`).length) {
            alert("Product already exists. Update the existing product or enter a different name.");
            return; // Stop execution if the product exists
        }
        const productDiv = $('<div>').addClass('product');
        const productTitle = $('<h2>').text(productName);
        const scoreDiv = $('<div>').addClass('score-inputs');
        const calculateBtn = $('<button>').text('Calculate Total Score').click(function () {
            calculateTotalScore(productName);
        });

        productDiv.append(productTitle, scoreDiv, calculateBtn);
        $('#products').append(productDiv);
        $('#newProductName').val('');

        $("#selectedCriteria li").each(function () {
            const criterion = $(this).text();
            const criterionId = `score-${productName}-${criterion.replace(/ /g, '-')}`;
            scoreDiv.append(`
                <div>
                    <label for="${criterionId}">${criterion}</label>
                    <input type="range" min="0" max="3" value="0" id="${criterionId}"
                           oninput="updateDisplayScore('${criterionId}', this.value)">
                    <span id="scoreValue-${criterionId}">0</span>
                </div>
            `);
        });
    }

    function calculateTotalScore(productName) {
        const weights = [18, 16, 14, 12, 10, 8, 7, 6, 5, 4];
        let totalScore = 0;

        $(`#products .product:contains(${productName}) .score-inputs div`).each(function (index) {
            const score = parseInt($(this).find('input[type="range"]').val(), 10);
            totalScore += (score / 3 * 100) * (weights[index] / 100);
        });

        // Update or Add new score to the table
        let scoreRow = $(`#scoreTable tbody tr:contains(${productName})`);
        if (scoreRow.length) {
            scoreRow.find('td:eq(1)').text(totalScore.toFixed(2));
        } else {
            $('#scoreTable tbody').append(`<tr><td>${productName}</td><td>${totalScore.toFixed(2)}</td></tr>`);
        }
        sortScoreTable();
    }

    function sortScoreTable() {
        var rows = $('#scoreTable tbody tr').get();
        rows.sort(function (a, b) {
            const keyA = parseFloat($(a).children('td').eq(1).text());
            const keyB = parseFloat($(b).children('td').eq(1).text());
            if (keyA < keyB) return 1;
            if (keyA > keyB) return -1;
            return 0;
        });
        $.each(rows, function (index, row) {
            $('#scoreTable tbody').append(row);
        });
    }

    window.updateDisplayScore = function (criterionId, value) {
        $(`#scoreValue-${criterionId}`).text(value);
    };

    function showError(message) {
        $('#error-message').text(message).show();
    }

    function hideError() {
        $('#error-message').hide();
    }
});
