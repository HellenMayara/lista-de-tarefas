const formulario = document.getElementById('formulario'); /* Seleciona o formulário do HTML */
const campoTarefa = document.getElementById('campoTarefa'); /* Seleciona o campo de entrada de tarefa do HTML */
const lista = document.getElementById('lista'); /* Seleciona a lista de tarefas do HTML */
const contador = document.getElementById('contador'); /* Seleciona o contador de tarefas do HTML */
const botoesFiltro = document.querySelectorAll(".filtro"); /* Seleciona todos os botões de filtro do HTML */

let tarefas = []; /* Array para armazenar as tarefas */
let filtroAtual = "todas"; /* Variável para armazenar o filtro atual (todas, pendentes ou concluídas) */

function salvar() {
    localStorage.setItem("tarefas", JSON.stringify(tarefas)); /* Salva a lista de tarefas no localStorage como uma string JSON */
}

function carregar() {
    const salvas = localStorage.getItem("tarefas"); /* Obtém a lista de tarefas do localStorage */

    if (salvas) {
        tarefas = JSON.parse(salvas); /* Converte a string JSON de volta para um array de tarefas */
    }
}

function renderizar() {
    lista.innerHTML = ""; /* Limpa a lista de tarefas antes de renderizar novamente */

    let visiveis = tarefas; /* Inicialmente, todas as tarefas são visíveis */

    if (filtroAtual === "pendentes") {
        visiveis = tarefas.filter(function (tarefa) {
            return !tarefa.concluida; /* Filtra apenas as tarefas pendentes */
        });
    } else if (filtroAtual === "concluidas") {
        visiveis = tarefas.filter(function (tarefa) {
            return tarefa.concluida; /* Filtra apenas as tarefas concluídas */
        })
    }

    if (visiveis.length === 0) {
        const vazio = document.createElement("li"); /* Cria um elemento de lista para exibir a mensagem de vazio */
        vazio.className = "vazio"; /* Adiciona a classe "vazio" ao elemento */
        vazio.textContent = "Nenhuma tarefa por aqui!"; /* Define o texto do elemento */
        lista.appendChild(vazio); /* Adiciona o elemento à lista */
    }

    visiveis.forEach(function (tarefa) {
        const item = document.createElement("li"); /* Cria um elemento de lista para cada tarefa */
        item.className = "item"; /* Adiciona a classe "item" ao elemento */
        item.dataset.id = tarefa.id; /* Define o atributo de dados "id" com base no ID da tarefa */

        if (tarefa.concluida) {
            item.classList.add("concluida"); /* Adiciona a classe "concluida" se a tarefa estiver concluída */
        }

        const caixa = document.createElement("input"); /* Cria um elemento de entrada para a caixa de seleção */
        caixa.type = "checkbox"; /* Define o tipo do elemento como checkbox */
        caixa.checked = tarefa.concluida; /* Define o estado da caixa de seleção com base na conclusão da tarefa */

        const texto = document.createElement("span"); /* Cria um elemento de span para o texto da tarefa */
        texto.className = "texto"; /* Adiciona a classe "texto" ao elemento */
        texto.textContent = tarefa.texto; /* Define o texto do elemento com base na tarefa */

        const excluir = document.createElement("button"); /* Cria um elemento de botão para excluir a tarefa */
        excluir.className = "excluir"; /* Adiciona a classe "excluir" ao elemento */
        excluir.textContent = "x"; /* Define o texto do botão como "x" */

        const editar = document.createElement("button"); /* Cria um elemento de botão para editar a tarefa */
        editar.className = "editar"; /* Adiciona a classe "editar" ao elemento */
        editar.textContent = "Editar"; /* Define o texto do botão como "Editar" */

        item.appendChild(caixa); /* Adiciona a caixa de seleção ao item da lista */
        item.appendChild(texto); /* Adiciona o texto da tarefa ao item da lista */

        if (!tarefa.concluida) {
            item.appendChild(editar); /* Adiciona o botão de editar ao item da lista apenas se a tarefa não estiver concluída */
        }

        item.appendChild(excluir); /* Adiciona o botão de excluir ao item da lista */
        lista.appendChild(item); /* Adiciona o item da lista à lista de tarefas */
    });

    const pendentes = tarefas.filter(function (tarefa) {
        return !tarefa.concluida; /* Filtra apenas as tarefas pendentes */
    }).length;

    contador.textContent = pendentes + (pendentes === 1 ? " tarefa pendente" : " tarefas pendentes"); /* Atualiza o contador de tarefas pendentes */
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault(); /* Impede o envio do formulário para evitar recarregar a página */

    const texto = campoTarefa.value.trim(); /* Obtém o valor do campo de entrada e remove espaços em branco */

    if (texto === "") {
        return; /* Se o campo estiver vazio, não faz nada */
    }

    tarefas.push({
        id: Date.now(), /* Gera um ID único para a tarefa com base no timestamp atual */
        texto: texto, /* Define o texto da tarefa */
        concluida: false /* Define a tarefa como não concluída inicialmente */
    });

    campoTarefa.value = ""; /* Limpa o campo de entrada após adicionar a tarefa */
    salvar(); /* Chama a função salvar para armazenar a lista de tarefas no localStorage */
    renderizar(); /* Chama a função renderizar para atualizar a lista de tarefas */
});

lista.addEventListener("click", function (evento) {
    const item = evento.target.closest(".item"); /* Obtém o item da lista mais próximo do elemento clicado */

    if (!item) {
        return; /* Se não houver um item da lista, não faz nada */
    }

    const id = Number(item.dataset.id); /* Obtém o ID da tarefa a partir do atributo de dados do item da lista */
    const tarefa = tarefas.find(function (t) { /* Procura a tarefa correspondente no array de tarefas com base no ID */
        return t.id === id; /* Retorna a tarefa correspondente */
    });

    if (!tarefa) {
        return; /* Se não houver uma tarefa correspondente, não faz nada */
    }

    if (evento.target.type === "checkbox") {
        tarefa.concluida = evento.target.checked; /* Atualiza o estado de conclusão da tarefa com base na caixa de seleção */
        salvar();
        renderizar();

    } else if (evento.target.classList.contains("excluir")) {
        tarefas = tarefas.filter(function (t) {
            return t.id !== tarefa.id; /* Remove a tarefa do array de tarefas com base no ID */
        });
        salvar(); /* Chama a função salvar para armazenar a lista de tarefas no localStorage */
        renderizar(); /* Chama a função renderizar para atualizar a lista de tarefas */

    } else if (evento.target.classList.contains("editar")) {
        entrarEmEdicao(item, tarefa); /* Chama a função entrarEmEdicao para permitir a edição da tarefa */
    }
});

botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () { /* Adiciona um evento de clique a cada botão de filtro */
        botoesFiltro.forEach(function (b) {
            b.classList.remove("ativo"); /* Remove a classe "ativo" de todos os botões de filtro */
        });
        botao.classList.add("ativo"); /* Adiciona a classe "ativo" ao botão de filtro clicado */
        filtroAtual = botao.dataset.filtro; /* Atualiza o filtro atual com base no botão clicado */
        renderizar(); /* Chama a função renderizar para atualizar a lista de tarefas com base no filtro selecionado */
    });
});

document.getElementById("limparConcluidas").addEventListener("click", function () {
    tarefas = tarefas.filter(function (tarefa) {
        return !tarefa.concluida; /* Remove todas as tarefas concluídas do array de tarefas */
    });
    salvar(); /* Chama a função salvar para armazenar a lista de tarefas no localStorage */
    renderizar(); /* Chama a função renderizar para atualizar a lista de tarefas */
});

function entrarEmEdicao(item, tarefa) {
    const texto = item.querySelector(".texto"); /* Seleciona o elemento de texto da tarefa */

    const campo = document.createElement("input"); /* Cria um elemento de entrada para edição */
    campo.type = "text"; /* Define o tipo do elemento como texto */
    campo.className = "campoEdicao"; /* Adiciona a classe "campoEdicao" ao elemento */
    campo.value = tarefa.texto; /* Define o valor do campo de edição com base no texto da tarefa */

    item.replaceChild(campo, texto); /* Substitui o elemento de texto pelo campo de edição */
    campo.focus(); /* Define o foco no campo de edição */
    campo.select(); /* Seleciona o texto no campo de edição */

    let finalizado = false; /* Variável para controlar se a edição foi finalizada */

    function confirmar() {
        if (finalizado) {
            return; /* Se a edição já foi finalizada, não faz nada */
        }
        finalizado = true; /* Marca a edição como finalizada */

        const novoTexto = campo.value.trim(); /* Obtém o valor do campo de edição e remove espaços em branco */

        if (novoTexto !== "") {
            tarefa.texto = novoTexto; /* Atualiza o texto da tarefa com o novo valor */
            salvar(); /* Chama a função salvar para armazenar a lista de tarefas no localStorage */
        }
        renderizar(); /* Chama a função renderizar para atualizar a lista de tarefas */
    }

    function cancelar() {
        if (finalizado) {
            return; /* Se a edição já foi finalizada, não faz nada */
        }
        finalizado = true; /* Marca a edição como finalizada */
        renderizar(); /* Chama a função renderizar para atualizar a lista de tarefas */
    }

    campo.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") {
            confirmar(); /* Confirma a edição se a tecla Enter for pressionada */
        } else if (evento.key === "Escape") {
            cancelar(); /* Cancela a edição se a tecla Escape for pressionada */
        }
    });

    campo.addEventListener("blur", confirmar); /* Confirma a edição se o campo perder o foco */
}

carregar();
renderizar();


