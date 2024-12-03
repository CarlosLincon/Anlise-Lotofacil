let freqComIndices = [];
let allRows = [];

document.getElementById('fileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = e.target.result;
    const workbook = XLSX.read(data, { type: 'binary' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    alert(`Arquivo carregado com sucesso! Total de linhas: ${allRows.length}`);
  };
  reader.readAsBinaryString(file);
});

function processarDados() {
    const recorteLinhas = parseInt(document.getElementById('recorteLinhas').value);
    const dadosRecorte = allRows.slice(-recorteLinhas);

    const frequencia = Array(25).fill(0);
    dadosRecorte.forEach(linha => {
        linha.forEach(numero => {
            if (numero >= 1 && numero <= 25) frequencia[numero - 1]++;
        });
    });

    freqComIndices = frequencia.map((freq, idx) => ({ numero: idx + 1, freq }));
    freqComIndices.sort((a, b) => b.freq - a.freq);

    preencherTabela('top10Table', freqComIndices.slice(0, 10));
    preencherTabela('menosFrequentesTable', freqComIndices.slice(-15));
    preencherTabela('maisFrequentesTable', freqComIndices.slice(0, 15));  // Preencher a nova tabela
    preencherTabela('imparesTable', freqComIndices.filter(item => item.numero % 2 !== 0));
    preencherTabela('paresTable', freqComIndices.filter(item => item.numero % 2 === 0));

    const ultimoJogo = allRows[allRows.length - 1];
    const repetidos = ultimoJogo.map(numero => ({
        numero, 
        freq: dadosRecorte.reduce((acc, linha) => acc + (linha.includes(numero) ? 1 : 0), 0)
    }));
    preencherTabela('repetidosTable', repetidos);
}


function preencherTabela(tabelaId, dados) {
  const tabela = document.getElementById(tabelaId);
  const tbody = tabela.querySelector('tbody');
  tbody.innerHTML = '';

  dados.forEach(dado => {
    const tr = document.createElement('tr');
    if (dado.freq !== undefined) {
      tr.innerHTML = `<td>${dado.numero}</td><td>${dado.freq}</td>`;
    } else {
      tr.innerHTML = `<td>${dado.numero}</td>`;
    }
    tbody.appendChild(tr);
  });
}

document.getElementById('pegarTodosJogosButton').addEventListener('click', function() {
  document.getElementById('recorteLinhas').value = allRows.length;
  processarDados();
});

document.getElementById('atualizarProcessarButton').addEventListener('click', processarDados);

document.getElementById('gerarJogoButton').addEventListener('click', gerarJogo);

function gerarParametrosAleatorios() {
  let qtdMaisFreq, qtdMenosFreq, qtdRepetidos, qtdImpares, qtdPares;
  let totalParametros = 0;

  while (totalParametros !== 15) {
    qtdMaisFreq = Math.floor(Math.random() * 16);
    qtdMenosFreq = Math.floor(Math.random() * 16);
    qtdRepetidos = Math.floor(Math.random() * 16);
    qtdImpares = Math.floor(Math.random() * 16);
    qtdPares = Math.floor(Math.random() * 16);
    totalParametros = qtdMaisFreq + qtdMenosFreq + qtdRepetidos + qtdImpares + qtdPares;
  }

  return { qtdMaisFreq, qtdMenosFreq, qtdRepetidos, qtdImpares, qtdPares };
}

function gerarJogo() {
  if (freqComIndices.length === 0) {
    alert('Por favor, carregue o arquivo e processe os dados primeiro.');
    return;
  }

  const parametros = gerarParametrosAleatorios();

  const maisFreq = freqComIndices.slice(0, parametros.qtdMaisFreq).map(item => item.numero);
  const menosFreq = freqComIndices.slice(-parametros.qtdMenosFreq).map(item => item.numero);
  const repetidos = allRows[allRows.length - 1].filter(numero => freqComIndices.some(item => item.numero === numero));
  const impares = freqComIndices.filter(item => item.numero % 2 !== 0).slice(0, parametros.qtdImpares).map(item => item.numero);
  const pares = freqComIndices.filter(item => item.numero % 2 === 0).slice(0, parametros.qtdPares).map(item => item.numero);

  let jogo = [...maisFreq, ...menosFreq, ...repetidos, ...impares, ...pares];
  jogo = [...new Set(jogo)];

  if (jogo.length > 15) {
    jogo = jogo.slice(0, 15);
  } else {
    while (jogo.length < 15) {
      const numeroAleatorio = Math.floor(Math.random() * 25) + 1;
      if (!jogo.includes(numeroAleatorio)) {
        jogo.push(numeroAleatorio);
      }
    }
  }

  jogo.sort((a, b) => a - b);

  const quadradosContainer = document.getElementById('quadradosContainer');
  quadradosContainer.innerHTML = '';
  jogo.forEach(numero => {
    const div = document.createElement('div');
    div.className = 'square';
    div.textContent = numero;
    quadradosContainer.appendChild(div);
  });

  const analise = `Análise do Jogo:
  - Qtd. Mais Frequentes: ${parametros.qtdMaisFreq}
  - Qtd. Menos Frequentes: ${parametros.qtdMenosFreq}
  - Qtd. Repetidos: ${parametros.qtdRepetidos}
  - Qtd. Ímpares: ${parametros.qtdImpares}
  - Qtd. Pares: ${parametros.qtdPares}`;

  document.getElementById('analiseJogo').textContent = analise;
}

function preencherTabelaDeCriterios() {
    if (freqComIndices.length === 0) {
      alert('Por favor, carregue o arquivo e processe os dados primeiro.');
      return;
    }
  
    // Ordenar freqComIndices pelo número em ordem crescente
    const ordenadoPorNumero = [...freqComIndices].sort((a, b) => a.numero - b.numero);
  
    const criteriosTableBody = document.getElementById('criteriosTableBody');
    criteriosTableBody.innerHTML = '';
  
    const ultimoJogo = allRows[allRows.length - 1];
  
    ordenadoPorNumero.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.numero}</td>
        <td>${item.freq >= freqComIndices[9].freq ? 'Sim' : 'Não'}</td>
        <td>${item.freq <= freqComIndices[freqComIndices.length - 15].freq ? 'Sim' : 'Não'}</td>
        <td>${item.numero % 2 !== 0 ? 'Sim' : 'Não'}</td>
        <td>${item.numero % 2 === 0 ? 'Sim' : 'Não'}</td>
        <td>${ultimoJogo.includes(item.numero) ? 'Sim' : 'Não'}</td>
      `;
      criteriosTableBody.appendChild(tr);
    });
}


  
  document.getElementById('verCriteriosButton').addEventListener('click', function() {
    preencherTabelaDeCriterios();
    const modal = new bootstrap.Modal(document.getElementById('criteriosModal'));
    modal.show();
  });
  