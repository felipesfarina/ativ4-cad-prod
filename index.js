const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const porta = 3000;

let listaProdutos = [];

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

app.use(session({
    secret: 'minhasenhasecreta123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000 }
}));

// verificar se ta logado
function verificaLogin(req, res, next) {
    if (req.session.nomeUsuario) {
        next();
    } else {
        res.send('<html><body><h2>Você precisa fazer login!</h2><a href="/login.html">Clique aqui para fazer login</a></body></html>');
    }
}

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// faz o login
app.post('/login', (req, res) => {
    const usuario = req.body.usuario;
    
    if (usuario) {
        req.session.nomeUsuario = usuario;
        const dataHora = new Date().toLocaleString('pt-BR');
        res.cookie('ultimoAcesso', dataHora, { maxAge: 1000 * 60 * 60 * 24 * 7 });
        res.redirect('/cadastro');
    } else {
        res.send('<html><body><h2>Nome de usuário inválido!</h2><a href="/login.html">Voltar</a></body></html>');
    }
});

// mostra o formulario de cadastro
app.get('/cadastro', verificaLogin, (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso';
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cadastro de Produtos</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: Arial, sans-serif; 
                background-color: #f5f5f5;
                padding: 20px;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { 
                color: #333; 
                margin-bottom: 20px;
            }
            .info { 
                background: #e7f3ff; 
                padding: 15px; 
                margin-bottom: 25px;
                border-radius: 5px;
                border-left: 4px solid #2196F3;
            }
            .logout { 
                float: right; 
                background: #f44336;
                color: white;
                padding: 8px 15px;
                text-decoration: none;
                border-radius: 4px;
                font-size: 14px;
            }
            .logout:hover { background: #d32f2f; }
            form { 
                background: #fafafa; 
                padding: 25px;
                border-radius: 5px;
                margin-bottom: 30px;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 15px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            label { 
                display: block; 
                margin-bottom: 6px;
                color: #555;
                font-weight: bold;
                font-size: 14px;
            }
            input { 
                width: 100%; 
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            input:focus {
                outline: none;
                border-color: #4CAF50;
            }
            button { 
                margin-top: 15px; 
                padding: 12px 30px; 
                background: #4CAF50; 
                color: white; 
                border: none; 
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
            }
            button:hover { background: #45a049; }
            h2 {
                color: #333;
                margin: 30px 0 15px 0;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px;
                background: white;
            }
            th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left;
            }
            th { 
                background-color: #4CAF50; 
                color: white;
                font-weight: bold;
            }
            tr:nth-child(even) {
                background-color: #f9f9f9;
            }
            tr:hover {
                background-color: #f5f5f5;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/logout" class="logout">Sair</a>
            <h1>Cadastro de Produtos</h1>
            <div class="info">
                <strong>Usuário:</strong> ${req.session.nomeUsuario}<br>
                <strong>Último acesso:</strong> ${ultimoAcesso}
            </div>
            
            <form method="POST" action="/cadastrar">
                <div class="form-row">
                    <div class="form-group">
                        <label>Código de Barras:</label>
                        <input type="text" name="codigoBarras" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Descrição do Produto:</label>
                        <input type="text" name="descricao" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Preço de Custo:</label>
                        <input type="number" step="0.01" name="precoCusto" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Preço de Venda:</label>
                        <input type="number" step="0.01" name="precoVenda" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Data de Validade:</label>
                        <input type="date" name="dataValidade" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Quantidade em Estoque:</label>
                        <input type="number" name="qtdEstoque" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Nome do Fabricante:</label>
                    <input type="text" name="fabricante" required>
                </div>
                
                <button type="submit">Cadastrar Produto</button>
            </form>
    `;
    
    if (listaProdutos.length > 0) {
        html += `
        <h2>Produtos Cadastrados</h2>
        <table>
            <thead>
                <tr>
                    <th>Código de Barras</th>
                    <th>Descrição</th>
                    <th>Preço Custo</th>
                    <th>Preço Venda</th>
                    <th>Validade</th>
                    <th>Estoque</th>
                    <th>Fabricante</th>
                </tr>
            </thead>
            <tbody>
        `;
        
        for (let i = 0; i < listaProdutos.length; i++) {
            html += `
                <tr>
                    <td>${listaProdutos[i].codigoBarras}</td>
                    <td>${listaProdutos[i].descricao}</td>
                    <td>R$ ${parseFloat(listaProdutos[i].precoCusto).toFixed(2)}</td>
                    <td>R$ ${parseFloat(listaProdutos[i].precoVenda).toFixed(2)}</td>
                    <td>${listaProdutos[i].dataValidade}</td>
                    <td>${listaProdutos[i].qtdEstoque}</td>
                    <td>${listaProdutos[i].fabricante}</td>
                </tr>
            `;
        }
        
        html += `
            </tbody>
        </table>
        `;
    }
    
    html += '</div></body></html>';
    res.send(html);
});

// cadastra o produto
app.post('/cadastrar', verificaLogin, (req, res) => {
    const produto = {
        codigoBarras: req.body.codigoBarras,
        descricao: req.body.descricao,
        precoCusto: req.body.precoCusto,
        precoVenda: req.body.precoVenda,
        dataValidade: req.body.dataValidade,
        qtdEstoque: req.body.qtdEstoque,
        fabricante: req.body.fabricante
    };
    
    listaProdutos.push(produto);
    
    const dataHora = new Date().toLocaleString('pt-BR');
    res.cookie('ultimoAcesso', dataHora, { maxAge: 1000 * 60 * 60 * 24 * 7 });
    
    res.redirect('/cadastro');
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.listen(porta, () => {
    console.log(`Servidor rodando na porta ${porta}`);
});

module.exports = app;
