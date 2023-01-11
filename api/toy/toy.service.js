const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        
        const collection = await dbService.getCollection('toy')
        if(filterBy.sort==="name") {var toys = await collection.find(criteria).sort({name: 1}).toArray()}
        else if (filterBy.sort==="price") {var toys = await collection.find(criteria).sort({price: -1}).toArray()}
        else var toys = await collection.find(criteria).sort({createdAt: -1}).toArray()
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
        return toyId
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        const toyOBG = await collection.insertOne(toy)
        const addedToy = getById(toyOBG.insertedId)
        return addedToy
        // return toyOBG
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}
async function update(toy) {
    try {
        var id = ObjectId(toy._id)
        var temp= toy._id
        delete toy._id
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: id }, { $set: { ...toy } })
        console.log(`toy = `, toy)
        toy._id=temp
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toyId}`, err)
        throw err
    }
}

async function addReview(review, toyId) {
    try {
      const collection = await dbService.getCollection('toy')
      review.id = utilService.makeId()
      review.createdAt = Date.now()
      await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { reviews: review } })
      return review
    } catch (err) {
      console.log(err)
      throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) {
        const txtCriteria = { $regex: filterBy.name, $options: 'i' }
        criteria.name= txtCriteria 
    }

    if (JSON.parse(filterBy.inStock)) {
        criteria.inStock =  true 
    }
    if (filterBy.label?.length>0) {
        if(!filterBy.label.includes('All'))
        criteria.labels =  { $all: filterBy.label } 
    }
    return criteria
}



module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    addReview
}