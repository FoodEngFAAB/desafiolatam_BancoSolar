const { Console } = require('console')
const { release } = require('os')
const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'JBJFourier1768@',
    database: 'BancoSolar',
    port: 5432
})

//Funcion asíncrona crea nuevo(s) registro(s)
const insertDB = async (dataQuery) => {
    const queryNewUser = {
        text: 'INSERT INTO usuarios(nombre, balance) values($1, $2)',
        values: dataQuery
    }
    try {
        const result = await pool.query(queryNewUser)
        console.log(`Usuario(a) ${nombre} creado exitosamente.`)
        return result
    } catch(error) {
        console.log('Ha ocurrido un error (INSERT INTO). Usuario(a) no creado(a). Código:\n', error.code)
        console.log('Error externo de try catch: ', error.message)
        console.log('Detalles: ', error.detail)
        console.log('Tabla origen del error: ', error.table)
        console.log('Restricción violada en el campo: ', error.constraint)
        return error
    }
}
//Funcion asíncrona consulta usuario(a)(s)
const queryDB = async () => {
    try {
        const result = await pool.query('SELECT * FROM usuarios')
        console.log(`Consulta realizada exitosamente.`)
        return result
    } catch (error) {
        console.log('ha ocurrido un error (SELECT *). Comuníquese con el(la) administrador(a). Código:\n', error.code)
        console.log('Error externo de try catch: ', error.message)
        console.log('Detalles: ', error.detail)
        console.log('Tabla origen del error: ', error.table)
        console.log('Restricción violada en el campo: ', error.constraint)
        return error
    }
}

//Funcion asíncrona edita usuario(a)(s)
const editDB = async (dataQuery, id) => {
    const queryEdit = {
        text: `UPDATE usuarios SET nombre=$1, balance=$2 WHERE id=${id} RETURNING *`,
        values:dataQuery
    }
    try {
        const result = await pool.query(queryEdit)
        console.log(`Usuario(a) ${id} modificado exitosamente.`)
        return result
    } catch(error) {
        console.log(`ha ocurrido un error (UPDATE). Usuario(a) ${id} no ha sido modificado. Código:\n`, error.code)
        console.log('Error externo de try catch: ', error.message)
        console.log('Detalles: ', error.detail)
        console.log('Tabla origen del error: ', error.table)
        console.log('Restricción violada en el campo: ', error.constraint)
        return error
    }
}

//Funcion asíncrona elimina usuario(a)(s)
const deleteDB = async (id) => {
    try {
        const result = await pool.query(`DELETE FROM usuarios WHERE id='${id}'`)
        console.log(`Usuario(a) ${id} eliminado exitosamente.`)
        return result
    } catch(error) {
        console.log(`ha ocurrido un error (DELETE). Usuario(a) ${id} no ha sido eliminado. Código:\n`, error.code)
        console.log('Error externo de try catch: ', error.message)
        console.log('Detalles: ', error.detail)
        console.log('Tabla origen del error: ', error.table)
        console.log('Restricción violada en el campo: ', error.constraint)
        return errort
    }
}

//Transacciones de cargo y abono a cuentas
const transferDB = async (dataQuery) => {
    try {
        await pool.query('BEGIN')
        
        //Cargo a la cuenta de origen
        const debit = {
            text:`UPDATE usuarios SET balance = balance - ${dataQuery[2]} WHERE nombre= '${dataQuery[0]}' RETURNING *`
        }
        const discount = await pool.query(debit)
        const credit = {
            text: `UPDATE usuarios SET balance= balance +${dataQuery[2]} WHERE nombre='${dataQuery[1]}' RETURNING *`
        }

        //Abono a la cuenta destino
        const payment = await pool.query(credit)
        console.log(`Se ha transferio un monto de '$${dataQuery[2]}' desde Usuario(a) '${dataQuery[0]}' a usuario(a) '${dataQuery[1]}'`)
        
        //Transferencia bancaria
        const wiring = {
        text: 'INSERT INTO transferencias(emisor,receptor,monto,fecha) VALUES($1, $2, $3, $4)',
        values: [discount.rows[0].id, payment.rows[0].id, dataQuery[2],new Date]
        }
        await pool.query(wiring)
        await pool.query('COMMIT')
        const data = [discount.rows[0].nombre, payment.rows[0].nombre, dataQuery[2],new Date]
        return data
    } catch(error) {
        await pool.query('ROLLBACK')
        console.log('Se ha detectado un error en la transferencia. Comuníquese con el(la) administrador(a):', error.code)
        console.log('Error externo de try catch: ', error.message)
        console.log('Detalles: ', error.detail)
        console.log('Tabla origen del error: ', error.table)
        console.log('Restricción violada en el campo: ', error.constraint)
        return error
    }
}
//Consulta las transferencia bancaras realizadas
const queryTransfDB = async () => {
    const queryTransfDBData = {
        rowMode: 'array',
        text:"SELECT transferencias.fecha, (SELECT nombre FROM usuarios WHERE transferencias.emisor = usuarios.id) AS emisor, nombre AS receptor, transferencias.monto FROM usuarios INNER JOIN transferencias ON transferencias.receptor = usuarios.id",
    }
    try {
        const result = await pool.query(queryTransfDBData)
        console.log(result.rows)
        return result
    } catch (error) {
        console.log('Se ha detectado un error en la consulta de transferencias. Comuníquese con el(la) administrador(a):', error.code)
        console.log('Error externo de try catch: ', error.message)
        console.log('Detalles: ', error.detail)
        console.log('Tabla origen del error: ', error.table)
        console.log('Restricción violada en el campo: ', error.constraint)
        return error
    }
}

//Exportan funciones
module.exports = { insertDB, queryDB, editDB, deleteDB, transferDB, queryTransfDB }