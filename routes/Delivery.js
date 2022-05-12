import express from "express";
import {promises as fs} from "fs";

const filename = "pedidos.json";
const router = express.Router();
const{readFile,writeFile} = fs;

const data2 = JSON.parse(await readFile(filename));
const timeElapsed = Date.now();
const today = new Date(timeElapsed);

/*
Crie um endpoint para criar um pedido. Esse endpoint deverá receber como parâmetros os
campos cliente, produto e valor conforme descritos acima. Este pedido deverá ser salvo no
arquivo json ‘pedidos.json’ e deverá ter um id único associado. No campo “timestamp”,
deverão ser salvos a data e a hora do momento da inserção. O campo “entregue” deverá ser criado inicialmente como “false”, pois ele poderá ser atualizado posteriormente através
de outro endpoint. O endpoint deverá retornar o objeto do pedido que foi criado.

A API deverá garantir o incremento automático deste identificador, de forma que ele não se
repita entre os registros. Dentro do arquivo pedidos.json, que foi fornecido para utilização
no desafio, o campo nextId já está com um valor definido. Após a inserção, é preciso que
esse nextId seja incrementado e salvo no próprio arquivo, de forma que na ele possa ser
utilizado próxima inserção
*/

router.post("/CriarPedidos", async (req, res) => {
try {
    let lastId = data2.nextId;
    let novoPedido = req.body;

    if (!novoPedido.cliente || !novoPedido.produto ||!novoPedido.valor || novoPedido.entregue != false){
         return res.send("Informe a marca que deseja buscar");
    }
    novoPedido = { 
     id:lastId++,  
     ...novoPedido,
     timestamp:today.toISOString()


    };
    data2.pedidos.push(novoPedido);
    data2.nextId++;
    
    await writeFile(filename,JSON.stringify(data2, null, 2));

    res.send(novoPedido);
}catch(err){
    res.status(400).send({err: err.message});
}


});

/*
Crie um endpoint para atualizar um pedido. Este endpoint deverá receber como
parâmetros o id do pedido a ser alterado e os campos “cliente”, “produto”, “valor” e
“entregue”. O endpoint deverá validar se o produto informado existe. Caso não exista, ele
deverá retornar um erro; caso exista, o endpoint deverá atualizar as informações recebidas
por parâmetros no registro e realizar sua atualização com os novos dados alterados no
arquivo pedidos.json.
 */

router.put("/AtualizarPedidos", async (req, res) => {
    try{
    let attPedido = req.body;
    let index = data2.pedidos.findIndex((item) => item.id == attPedido.id);
    let buscarProduto = data2.pedidos.find((item) => item.id == attPedido.id);

    if (buscarProduto.produto != attPedido.produto){
        return res.send("Produto não existe");
    }

    attPedido = { 
    
        ...attPedido,
        timestamp:today.toISOString()
    };

    data2.pedidos[index] = attPedido; 

    await writeFile(filename,JSON.stringify(data2, null, 2));

    res.send(data2.pedidos[index]);
    }catch(err){
        res.status(400).send({err: err.message});
    }


});
/*
Crie um endpoint para atualizar o status de entrega do pedido, alterando o campo
“entregue” de acordo com o parâmetro informado. Este endpoint deverá receber como
parâmetros o id do pedido a ser alterado e o novo valor para o campo “entregue”, sendo os
valores possíveis true ou false. Este endpoint deverá atualizar somente o valor do campo
“entregue” do registro de ID informado, alterando-o no arquivo pedidos.json.
*/

router.patch("/AtualizarStatus",async (req ,res) => {
    try{
        let attPedido = req.body;

    if ( attPedido.entregue !== true && attPedido.entregue !== false  ){
        return res.send("Valor Entregue não é booleano");
    }
    let index = data2.pedidos.findIndex((item) => item.id == attPedido.id);
    data2.pedidos[index].entregue = attPedido.entregue;
 
    await writeFile(filename,JSON.stringify(data2, null, 2));

    res.send(data2.pedidos[index]);
}catch(err){
    res.status(400).send({err: err.message});
}

});
/* Crie um endpoint para excluir um pedido. Este endpoint deverá receber como parâmetro o
id do pedido e realizar sua exclusão no arquivo pedidos.json.
*/

router.delete("/DeletarPedido/:id", async ( req, res) => {
    try{
        data2.pedidos = data2.pedidos.filter(pedido => pedido.id !== parseInt (req.params.id));

        await writeFile(filename,JSON.stringify(data2, null, 2));

        res.end();

    }catch (err){
        res.status(400).send({err: err.message});
    }

})

/*Crie um endpoint para consultar um pedido em específico. Este endpoint deverá receber
como parâmetro o id do pedido e retornar suas informações. */
router.get("/ConsultarPedido/:id",async (req , res) => {
    try{
        let ConsultaPedido = data2.pedidos.filter(pedido => pedido.id == parseInt (req.params.id))

        res.send(ConsultaPedido);
    }catch (err){
        res.status(400).send({err: err.message});
    }

});
/*Crie um endpoint para consultar o valor total de pedidos já realizados por um mesmo
cliente. O endpoint deverá receber como parâmetro o cliente, realizar a soma dos valores
de todos os seus pedidos e retornar essa informação. O endpoint deve considerar somente
os pedidos já entregues.*/
router.get("/ConsultaCliente/:cliente", async (req,res)=> {
    try{
        let Valor = 0;
        let ConsultaCliente = data2.pedidos.filter(pedido => pedido.cliente == (req.params.cliente))
        for (let item of ConsultaCliente){
            if(item.entregue ==true){
                Valor += item.valor;
            }
           
           
        }
        res.send("Valor total igual = " +Valor);

    }catch (err){
        res.status(400).send({err: err.message});
    }
})

/*Crie um endpoint para consultar o valor total de pedidos já realizados para um
determinado produto. O endpoint deverá receber como parâmetro o produto, realizar a
soma dos valores de todos os pedidos deste produto específico e retornar essa informação.
O endpoint deve considerar somente os pedidos já entregues.
*/

router.get("/ConsultaProduto/:produto", async (req,res)=>{
    try{
        let Valor = 0;
        let ConsultaProduto = data2.pedidos.filter(pedido => pedido.produto == (req.params.produto))
        for (let item of ConsultaProduto){
            if(item.entregue ==true){
                Valor += item.valor;
            }
            
        }
    res.send("Valor total de vendas deste PRODUTO igual = " +Valor);
    }catch(err){
        res.status(400).send({err: err.message});
    }
});
/*
Crie um endpoint para retornar os produtos mais vendidos e a quantidade de vezes em que
estes foram pedidos. O endpoint não deve receber parâmetros. O endpoint deve calcular
os produtos que mais possuem pedidos e retorná-los em ordem decrescente, seguidos pela
sua quantidade. exemplo: [“Pizza A - 30”, “Pizza B – 27”, “Pizza C – 25”, “Pizza D – 23”, “Pizza
E – 21”, “Pizza F – 19”, “Pizza G – 17”]. O endpoint deve considerar somente os pedidos já entregues.
*/
router.get("/MaisVendidos", async (req,res)=>{
    try{
        let arr = data2.pedidos;
        let key = "produto"
        const contagemProdutos = findOcc(arr,key);
        contagemProdutos.sort((a, b) => a.occurrence > b.occurrence ? -1 : a.occurrence < b.occurrence ? 1 : -1);
        res.send(contagemProdutos);

        
        /*
          1: Fazer um for que Conta qnts vezes o PRODUTO X aparece no arquivo  E ARMAZENA em um novo ARRAY;*/

     
    }catch(err){
        res.status(400).send({err: err.message});
    }
});

function findOcc(arr, key){
    let arr2 = [];
      
    arr.forEach((x)=>{
         
      // Checking if there is any object in arr2
      // which contains the key value
       if(arr2.some((val)=>{ return val[key] == x[key] })){
           
         // If yes! then increase the occurrence by 1
         arr2.forEach((k)=>{
           if(k[key] === x[key]){ 
             k["occurrence"]++
           }
        })
           
       }else{
         // If not! Then create a new object initialize 
         // it with the present iteration key's value and 
         // set the occurrence to 1
         let a = {}
         a[key] = x[key]
         a["occurrence"] = 1
         arr2.push(a);
       }
    })
      
    return arr2
  }




export default router;
