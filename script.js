// script.js
function calculateResult() {
    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    const answers = {};

    // Initialize counters for each answer
    formData.forEach((value) => {
        if (!answers[value]) {
            answers[value] = 0;
        }
        answers[value]++;
    });

    // Determine the most selected answer
    let maxCount = 0;
    let result = '';
    for (const answer in answers) {
        if (answers[answer] > maxCount) {
            maxCount = answers[answer];
            result = answer;
        }
    }

    // Map the result to the corresponding area
    const resultMap = {
        a: 'Cibersegurança',
        b: 'Criptomoedas',
        c: 'Gestão de TI',
        d: 'Dados',
        e: 'Programação',
        f: 'Design/Jogos Digitais'
    };

    // Display the result
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<h2>Você se encaixa melhor na área de ${resultMap[result]}</h2>`;
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}
