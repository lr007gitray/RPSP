let sliderPositions = { 'slider-dados': 0, 'slider-questoes': 0 };
let dadosQuiz = { capitulo: "", tituloApoio: "", urlV1: "", urlV2: "", imagemResumo: "", questoes: [] };

// Array global com marcadores customizados reduzido para 10 itens
const marcadoresQuestoes = [
    "🤔 01", "🤔 02", "🤔 03", "🤔 04", "🤔 05", 
    "🤔 06", "🤔 07", "🤔 08", "🤔 09", "🤔 10"
];

function moveSlider(sliderId, direction, indicatorId, totalSlides) {
    let currentIdx = sliderPositions[sliderId];
    currentIdx += direction;
    if (currentIdx < 0) currentIdx = 0;
    if (currentIdx >= totalSlides) currentIdx = totalSlides - 1;
    
    sliderPositions[sliderId] = currentIdx;
    const container = document.getElementById(sliderId);
    container.style.transform = `translateX(-${currentIdx * 100}%)`;
    document.getElementById(indicatorId).innerText = `${currentIdx + 1} / ${totalSlides}`;
}

function carregarImagemLocal(input) {
    if (input.files && input.files[0]) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            document.getElementById('adm-img-base64').value = e.target.result;
            document.getElementById('pub-img-resumo').src = e.target.result;
            document.getElementById('pub-img-resumo').style.display = "block";
            document.getElementById('msg-sem-imagem').style.display = "none";
        };
        leitor.readAsDataURL(input.files[0]);
    }
}

// Criação dinâmica no painel admin limitada a 10 questões
const sliderQuestoes = document.getElementById('slider-questoes');
for (let i = 1; i <= 10; i++) {
    const slide = document.createElement('div');
    slide.className = 'slide-item';
    slide.innerHTML = `
        <strong style="color:var(--primary); display:block; margin-bottom:8px;">Questão ${marcadoresQuestoes[i-1]} de 10</strong>
        <div class="form-group"><input type="text" id="adm-q${i}-p" placeholder="Pergunta da questão ${i}"></div>
        <div class="form-group"><input type="text" id="adm-q${i}-a" placeholder="Alternativa A"></div>
        <div class="form-group"><input type="text" id="adm-q${i}-b" placeholder="Alternativa B"></div>
        <div class="form-group"><input type="text" id="adm-q${i}-c" placeholder="Alternativa C"></div>
        <div class="form-group"><input type="text" id="adm-q${i}-d" placeholder="Alternativa D"></div>
        <div class="form-group">
            <label style="color:#b91c1c">Gabarito Certo:</label>
            <select id="adm-q${i}-g">
                <option value="A">Alternativa A</option>
                <option value="B">Alternativa B</option>
                <option value="C">Alternativa C</option>
                <option value="D">Alternativa D</option>
            </select>
        </div>
    `;
    sliderQuestoes.appendChild(slide);
}

function processarTextoImportado() {
    const texto = document.getElementById('txt-importar').value.trim();
    if (!texto) return alert("Por favor, cole algum texto antes de processar.");
    const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let questaoAtual = 0;
    let l = 0;
    
    // Limpando campos para 10 questões
    for(let i=1; i<=10; i++) {
        document.getElementById(`adm-q${i}-p`).value = "";
        document.getElementById(`adm-q${i}-a`).value = "";
        document.getElementById(`adm-q${i}-b`).value = "";
        document.getElementById(`adm-q${i}-c`).value = "";
        document.getElementById(`adm-q${i}-d`).value = "";
        document.getElementById(`adm-q${i}-g`).value = "A";
    }

    while (l < linhas.length && questaoAtual < 10) {
        let line = linhas[l];
        if (line.match(/^\d+[\s\.\)-]/) || (!line.match(/^[\*\(]?[A-D][\s\.\)-]/i) && line.length > 10)) {
            questaoAtual++;
            let textoPergunta = line.replace(/^\d+[\s\.\)-]*/, '');
            document.getElementById(`adm-q${questaoAtual}-p`).value = textoPergunta;
            
            let totalAlternativasEncontradas = 0;
            let busca = l + 1;
            while (busca < linhas.length && totalAlternativasEncontradas < 4) {
                let containerTexto = linhas[busca];
                if(!containerTexto) break;
                if (containerTexto.match(/^\d+[\s\.\)-]/) && totalAlternativasEncontradas > 0) break;

                let matchAlt = containerTexto.match(/^[\*\(]?[A-D][\s\.\)-]/i);
                if (matchAlt) {
                    totalAlternativasEncontradas++;
                    let letra = matchAlt[0].replace(/[\*\(\)\s\.\-]/g, '').toUpperCase();
                    let textoAlt = containerTexto.replace(/^[\*\(]?[A-D][\s\.\)-]/i, '');
                    
                    document.getElementById(`adm-q${questaoAtual}-${letra.toLowerCase()}`).value = textoAlt;
                    if (containerTexto.includes('*') || containerTexto.toUpperCase().includes('(X)')) {
                        document.getElementById(`adm-q${questaoAtual}-g`).value = letra;
                    }
                }
                busca++;
            }
            l = busca - 1;
        }
        l++;
    }
    alert("✨ Processado! Questões identificadas e preenchidas.");
    salvarLocalStorage();
}

function coletarDados() {
    dadosQuiz.capitulo = document.getElementById('adm-capitulo').value;
    dadosQuiz.tituloApoio = document.getElementById('adm-titulo-apoio').value;
    dadosQuiz.urlV1 = document.getElementById('adm-url-v1').value;
    dadosQuiz.urlV2 = document.getElementById('adm-url-v2').value;
    dadosQuiz.imagemResumo = document.getElementById('adm-img-base64').value;
    dadosQuiz.questoes = [];
    for (let i = 1; i <= 10; i++) {
        dadosQuiz.questoes.push({
            num: i,
            pergunta: document.getElementById(`adm-q${i}-p`).value,
            a: document.getElementById(`adm-q${i}-a`).value,
            b: document.getElementById(`adm-q${i}-b`).value,
            c: document.getElementById(`adm-q${i}-c`).value,
            d: document.getElementById(`adm-q${i}-d`).value,
            correta: document.getElementById(`adm-q${i}-g`).value
        });
    }
}

function salvarLocalStorage() {
    coletarDados();
    localStorage.setItem('rpsp_slide_data', JSON.stringify(dadosQuiz));
    renderizarPreview();
}

function renderizarPreview() {
    document.getElementById('header-titulo').innerText = dadosQuiz.capitulo ? dadosQuiz.capitulo.toUpperCase() : "QUIZ BÍBLICO INTELIGENTE";
    document.getElementById('header-subtitulo').innerText = dadosQuiz.tituloApoio || "Projeto Reavivados Por Sua Palavra (RPSP)";
    document.getElementById('pub-link-v1').href = dadosQuiz.urlV1 || '#';
    document.getElementById('pub-link-v2').href = dadosQuiz.urlV2 || '#';
    
    const imgEl = document.getElementById('pub-img-resumo');
    const msgEl = document.getElementById('msg-sem-imagem');
    if(dadosQuiz.imagemResumo) {
        imgEl.src = dadosQuiz.imagemResumo;
        imgEl.style.display = "block";
        msgEl.style.display = "none";
    } else {
        imgEl.src = "";
        imgEl.style.display = "none";
        msgEl.style.display = "block";
    }

    const container = document.getElementById('container-questoes-publicas');
    container.innerHTML = "";
    
    dadosQuiz.questoes.forEach(q => {
        if(!q.pergunta) return; 
        const div = document.createElement('div');
        div.className = 'q-card';
        div.innerHTML = `
            <div class="q-titulo">${marcadoresQuestoes[q.num-1]}. ${q.pergunta}</div>
            <div class="opcoes-container">
                <label class="opcao-label" id="label-q${q.num}-A"><input type="radio" name="publica${q.num}" value="A"> A) ${q.a}</label>
                <label class="opcao-label" id="label-q${q.num}-B"><input type="radio" name="publica${q.num}" value="B"> B) ${q.b}</label>
                <label class="opcao-label" id="label-q${q.num}-C"><input type="radio" name="publica${q.num}" value="C"> C) ${q.c}</label>
                <label class="opcao-label" id="label-q${q.num}-D"><input type="radio" name="publica${q.num}" value="D"> D) ${q.d}</label>
            </div>
        `;
        container.appendChild(div);
    });
    document.getElementById('resultado-card').style.display = "none";
}

function corrigirQuiz() {
    let acertos = 0;
    let totalValidas = 0;
    dadosQuiz.questoes.forEach(q => {
        if(!q.pergunta) return;
        totalValidas++;
        const marcado = document.querySelector(`input[name="publica${q.num}"]:checked`);
        ['A','B','C','D'].forEach(l => {
            const el = document.getElementById(`label-q${q.num}-${l}`);
            if(el) el.classList.remove('correta-marcada','errada-marcada');
        });
        if(marcado) {
            if(marcado.value === q.correta) { 
                acertos++; 
                document.getElementById(`label-q${q.num}-${q.correta}`).classList.add('correta-marcada'); 
            } else { 
                document.getElementById(`label-q${q.num}-${marcado.value}`).classList.add('errada-marcada'); 
                document.getElementById(`label-q${q.num}-${q.correta}`).classList.add('correta-marcada'); 
            }
        } else { 
            const elCorreta = document.getElementById(`label-q${q.num}-${q.correta}`);
            if(elCorreta) elCorreta.classList.add('correta-marcada'); 
        }
    });
    
    let pct = totalValidas > 0 ? Math.round((acertos/totalValidas)*100) : 0;
    let statusTexto = "";
    let mensagemTexto = "";
    if (pct === 100) {
        statusTexto = "🏆 Excelente!!!";
        mensagemTexto = "Você domina completamente o assunto deste capítulo.";
    } else if (pct >= 70) {
        statusTexto = "🤩 Muito Bem!!!";
        mensagemTexto = "Ótimo Resultado!!! Seu Conhecimento Bíblico está Afiado.";
    } else if (pct >= 50) {
        statusTexto = "👍 Bom Trabalho!!!";
        mensagemTexto = "Você acertou metade ou mais! Continue firme na leitura.";
    } else {
        statusTexto = "📚 Vamos Revisar???";
        mensagemTexto = "Vale a Pena Ler o Capítulo Novamente para Fixar o Conhecimento.";
    }
    
    document.getElementById('resultado-status').innerText = statusTexto;
    document.getElementById('resultado-mensagem').innerText = mensagemTexto;
    document.getElementById('resultado-card').style.display = "block";
    document.getElementById('resultado-score').innerText = `${acertos} de ${totalValidas}`;
    document.getElementById('resultado-percentual').innerText = `Aproveitamento: ${pct}%`;
    document.getElementById('resultado-card').scrollIntoView({behavior:'smooth'});
}

function limparRespostasPublicas() {
    const inputs = document.querySelectorAll('#quiz-form input[type="radio"]');
    inputs.forEach(input => input.checked = false);
    
    const labels = document.querySelectorAll('.opcao-label');
    labels.forEach(label => label.classList.remove('correta-marcada', 'errada-marcada'));

    document.getElementById('resultado-card').style.display = "none";
    window.scrollTo({top: document.getElementById('secao-publica').offsetTop, behavior: 'smooth'});
}

function exportarPaginaCompleta() {
    if(document.getElementById('adm-capitulo').value || document.getElementById('adm-img-base64').value) {
        coletarDados();
    } else {
        const dadosLocais = localStorage.getItem('rpsp_slide_data');
        if(dadosLocais) { dadosQuiz = JSON.parse(dadosLocais); }
    }

    if(!dadosQuiz.capitulo && !dadosQuiz.imagemResumo) {
        return alert("Nenhum dado encontrado para exportar! Preencha e salve primeiro.");
    }

    let dadosString = JSON.stringify(dadosQuiz).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    
    // O HTML gerado para exportação também já foi atualizado para o limite de 10 questões
    let htmlFinal = '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n' +
        document.getElementsByTagName('head')[0].innerHTML + '\n</head>\n<body>\n' +
        '<div class="container">\n' +
        '    <header>\n' +
        '        <h1 id="header-titulo">QUIZ BÍBLICO</h1>\n' +
        '        <p id="header-subtitulo"></p>\n' +
        '    </header>\n' +
        '    <div id="secao-publica" style="margin-top: 20px; border-top: 4px solid var(--primary); padding-top: 20px;">\n' +
        '        <div class="card">\n' +
        '            <h2>🎥 Material em Vídeo</h2>\n' +
        '            <a id="pub-link-v1" class="video-btn" target="_blank" href="#">📖 Assistir Leitura</a>\n' +
        '            <a id="pub-link-v2" class="video-btn" target="_blank" href="#">💡 Assistir Comentário</a>\n' +
        '        </div>\n' +
        '        <div class="card">\n' +
        '            <h2>📜 Resumo Ilustrado</h2>\n' +
        '            <div class="container-imagem-resumo" id="container-da-imagem">\n' +
        '                <img id="pub-img-resumo" class="imagem-resumo-img" src="" alt="Resumo Ilustrado">\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="card">\n' +
        '            <h2>🎯 Quiz do Conhecimento</h2>\n' +
        '            <form id="quiz-form">\n' +
        '                <div id="container-questoes-publicas"></div>\n' +
        '                <button type="button" class="btn btn-primary" onclick="corrigirQuiz()">✅ FINALIZAR QUIZ</button>\n' +
        '            </form>\n' +
        '        </div>\n' +
        '        <div id="resultado-card" class="card" style="display:none; text-align:center;">\n' +
        '            <div class="badge">RESULTADO</div>\n' +
        '            <h2 style="justify-content: center;" id="resultado-status">🎉 Parabéns!</h2>\n' +
        '            <div id="resultado-score" class="score-big">0 / 0</div>\n' +
        '            <p id="resultado-percentual" style="font-weight: bold; margin-bottom: 8px;">0%</p>\n' +
        '            <p id="resultado-mensagem">Continue lendo a Palavra diariamente!</p>\n' +
        '            <button type="button" class="btn btn-warning" onclick="limparRespostasPublicas()" style="margin-top:15px;">🔄 REFAZER QUIZ</button>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>\n' +
        '<script>\n' +
        '    let dadosQuiz = JSON.parse("' + dadosString + '");\n' +
        '    const marcadoresQuestoes = ["🤔 01", "🤔 02", "🤔 03", "🤔 04", "🤔 05", "🤔 06", "🤔 07", "🤔 08", "🤔 09", "🤔 10"];\n' +
        '    window.onload = function() {\n' +
        '        document.getElementById("header-titulo").innerText = dadosQuiz.capitulo ? dadosQuiz.capitulo.toUpperCase() : "QUIZ BÍBLICO";\n' +
        '        document.getElementById("header-subtitulo").innerText = dadosQuiz.tituloApoio || "";\n' +
        '        document.getElementById("pub-link-v1").href = dadosQuiz.urlV1 || "#";\n' +
        '        document.getElementById("pub-link-v2").href = dadosQuiz.urlV2 || "#";\n' +
        '        if(dadosQuiz.imagemResumo){\n' +
        '             document.getElementById("pub-img-resumo").src = dadosQuiz.imagemResumo;\n' +
        '        } else {\n' +
        '             document.getElementById("container-da-imagem").style.display = "none";\n' +
        '        }\n' +
        '        const container = document.getElementById("container-questoes-publicas");\n' +
        '        container.innerHTML = "";\n' +
        '        dadosQuiz.questoes.forEach(function(q) {\n' +
        '            if(!q.pergunta) return;\n' +
        '            const div = document.createElement("div");\n' +
        '            div.className = "q-card";\n' +
        '            div.innerHTML = \'<div class="q-titulo">\' + marcadoresQuestoes[q.num-1] + \'. \' + q.pergunta + \'</div>\' +\n' +
        '                \'<div class="opcoes-container">\' +\n' +
        '                    \'<label class="opcao-label" id="label-q\' + q.num + \'-A"><input type="radio" name="publica\' + q.num + \'" value="A"> A) \' + q.a + \'</label>\' +\n' +
        '                    \'<label class="opcao-label" id="label-q\' + q.num + \'-B"><input type="radio" name="publica\' + q.num + \'" value="B"> B) \' + q.b + \'</label>\' +\n' +
        '                    \'<label class="opcao-label" id="label-q\' + q.num + \'-C"><input type="radio" name="publica\' + q.num + \'" value="C"> C) \' + q.c + \'</label>\' +\n' +
        '                    \'<label class="opcao-label" id="label-q\' + q.num + \'-D"><input type="radio" name="publica\' + q.num + \'" value="D"> D) \' + q.d + \'</label>\' +\n' +
        '                \'</div>\';\n' +
        '            container.appendChild(div);\n' +
        '        });\n' +
        '    };\n' +
        '    ' + corrigirQuiz.toString() + '\n' +
        '    ' + limparRespostasPublicas.toString() + '\n' +
        '<\/script>\n</body>\n</html>';

    let blob = new Blob([htmlFinal], { type: "text/html;charset=utf-8" });
    let linkDownload = document.createElement("a");
    linkDownload.href = URL.createObjectURL(blob);
    linkDownload.download = "quiz_pronto.html";
    document.body.appendChild(linkDownload);
    linkDownload.click();
    document.body.removeChild(linkDownload);
    
    alert("📥 Pronto! Arquivo gerado com sucesso.");
}

function prepararProximoCapitulo() {
    if(!confirm("Deseja preparar a tela para o próximo capítulo?")) return;
    document.getElementById('txt-importar').value = "";
    document.getElementById('adm-titulo-apoio').value = "";
    document.getElementById('adm-img-upload').value = "";
    document.getElementById('adm-img-base64').value = "";
    for(let i=1; i<=10; i++) {
        document.getElementById(`adm-q${i}-p`).value = "";
        document.getElementById(`adm-q${i}-a`).value = "";
        document.getElementById(`adm-q${i}-b`).value = "";
        document.getElementById(`adm-q${i}-c`).value = "";
        document.getElementById(`adm-q${i}-d`).value = "";
        document.getElementById(`adm-q${i}-g`).value = "A";
    }
    salvarLocalStorage();
}

function limparTudo() {
    if(!confirm("Tem certeza que deseja resetar tudo?")) return;
    document.getElementById('txt-importar').value = "";
    document.getElementById('adm-capitulo').value = "";
    document.getElementById('adm-titulo-apoio').value = "";
    document.getElementById('adm-url-v1').value = "";
    document.getElementById('adm-url-v2').value = "";
    document.getElementById('adm-img-upload').value = "";
    document.getElementById('adm-img-base64').value = "";
    for(let i=1; i<=10; i++) {
        document.getElementById(`adm-q${i}-p`).value = "";
        document.getElementById(`adm-q${i}-a`).value = "";
        document.getElementById(`adm-q${i}-b`).value = "";
        document.getElementById(`adm-q${i}-c`).value = "";
        document.getElementById(`adm-q${i}-d`).value = "";
        document.getElementById(`adm-q${i}-g`).value = "A";
    }
    localStorage.removeItem('rpsp_slide_data');
    dadosQuiz = { capitulo: "", tituloApoio: "", urlV1: "", urlV2: "", imagemResumo: "", questoes: [] };
    renderizarPreview();
}

window.onload = function() {
    const localData = localStorage.getItem('rpsp_slide_data');
    if (localData) { 
        dadosQuiz = JSON.parse(localData); 
        renderizarPreview();
        document.getElementById('adm-capitulo').value = dadosQuiz.capitulo || "";
        document.getElementById('adm-titulo-apoio').value = dadosQuiz.tituloApoio || "";
        document.getElementById('adm-url-v1').value = dadosQuiz.urlV1 || "";
        document.getElementById('adm-url-v2').value = dadosQuiz.urlV2 || "";
        document.getElementById('adm-img-base64').value = dadosQuiz.imagemResumo || "";
        for(let i=1; i<=10; i++) {
            let q = dadosQuiz.questoes[i-1];
            if(q) {
                document.getElementById(`adm-q${i}-p`).value = q.pergunta || "";
                document.getElementById(`adm-q${i}-a`).value = q.a || "";
                document.getElementById(`adm-q${i}-b`).value = q.b || "";
                document.getElementById(`adm-q${i}-c`).value = q.c || "";
                document.getElementById(`adm-q${i}-d`).value = q.d || "";
                document.getElementById(`adm-q${i}-g`).value = q.correta || "A";
            }
        }
    }
};
