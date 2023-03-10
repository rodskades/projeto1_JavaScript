import api from './api';

// Lista de repositórios:
let repositorios = JSON.parse(localStorage.getItem('repositorios')) || [];

class App {
    // Construtor:
    constructor(){
        // Form
        this.formulario = document.querySelector('form');

        // Lista
        this.lista = document.querySelector('.list-group');

        // Método para registrar os eventos do form:
        this.registrarEventos();

        this.renderizarTela();
    }

    registrarEventos(){
        this.formulario.onsubmit = evento => this.adicionarRepositorio(evento);
    }

    async adicionarRepositorio(evento){
        // Evita que o formulário recarregue a página:
        evento.preventDefault();

        // Recuperar o valor do input:
        let input = this.formulario.querySelector('input[id=repositorio]').value;

        // Se o input vier vazio, sai da app:
        if(input.length === 0){
            return;  // return sempre sai da função
        }

        // Ativa o carregamento:
        this.apresentarBuscando();

        try{
            let response = await api.get(`/repos/${input}`);
            

            let {name, description, html_url, owner: {avatar_url} } = response.data;

            // Adicionar o repositório na lista:
            repositorios.push({
                nome: name,
                descricao: description,
                avatar_url,
                link: html_url,
            });

            // Renderizar a tela
            this.renderizarTela();

            // Salvar os dados no banco de dados:
            this.salvarDados();
        }catch(erro){
            // Limpa buscando...
            this.lista.removeChild(document.querySelector('.list-group-item-warning'));
            
            // Limpar erros existentes:
            let er = this.lista.querySelector('.list-group-item-danger');
            if(er !== null){
                this.lista.removeChild(er);
            }
            
            // <li>
            let li = document.createElement('li');
            li.setAttribute('class', 'list-group-item list-group-item-danger');
            let txtErro = document.createTextNode(`O repositório ${input} não existe.`);
            li.appendChild(txtErro);
            this.lista.appendChild(li);
        }
    }

    apresentarBuscando(){
        let input = this.formulario.querySelector('input[id=repositorio]').value;
        // <li>
        let li = document.createElement('li');
        li.setAttribute('class', 'list-group-item list-group-item-warning');
        let txtBuscando = document.createTextNode(`Aguarde... Buscando o repositório ${input}...`);
        li.appendChild(txtBuscando);
        this.lista.appendChild(li);
    }

    renderizarTela(){
        // Limpar o conteúdo de lista:
        this.lista.innerHTML = '';

        // Percorrer toda a lista de repositórios e criar os elementos:
        repositorios.forEach(repositorio => {
            // Criando um elemento <li>
            let li = document.createElement('li');
            li.setAttribute('class', 'list-group-item list-group-item-action');

            // Criando um elemento <img>
            let img = document.createElement('img');
            img.setAttribute('src', repositorio.avatar_url);
            li.appendChild(img);

            // Criando um elemento <strong>
            let strong = document.createElement('strong');
            let txtNome = document.createTextNode(repositorio.nome);
            strong.appendChild(txtNome);
            li.appendChild(strong);

            // Criando um elemento <p>
            let p = document.createElement('p');
            let txtDescricao = document.createTextNode(repositorio.descricao);
            p.appendChild(txtDescricao);
            li.appendChild(p);

            // Criando um elemento <a>
            let a = document.createElement('a');
            a.setAttribute('target', '_blank');
            a.setAttribute('href', repositorio.link);
            let txtA = document.createTextNode('Acessar');
            a.appendChild(txtA);
            li.appendChild(a);

            // Adicionar <li> como filho da <ul>
            this.lista.appendChild(li);

            // Limpar o conteúdo do input:
            this.formulario.querySelector('input[id=repositorio]').value = '';

            // Adiciona o foco no input:
            this.formulario.querySelector('input[id=repositorio]').focus();

            let self = this;
            li.onclick = function(){
                let item = this.childNodes[1].innerHTML;
                
                repositorios = repositorios.filter(function(el){
                    return el.nome != item;
                });

                self.renderizarTela();

                self.salvarDados();
            }
        });
    }

    // Função para salvar os dados no Storage
    salvarDados(){
        localStorage.setItem('repositorios', JSON.stringify(repositorios));
    }
}

new App();
