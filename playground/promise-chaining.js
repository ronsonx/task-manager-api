require('../src/db/mongoose')
const User = require('../src/models/user')

//5cc99f989f2ecd3cc48c4db2

// User.findByIdAndUpdate('5cc99f989f2ecd3cc48c4db2',{ age: 27}).then((user)=>{
//     console.log(user)
//     return User.countDocuments({age:27})
// }).then((count)=>{
//     console.log(count)
// }).catch((e)=>{
//     console.log(e)
// })

const updateAgeAndCount = async (id, age) => {
    const user = await User.findByIdAndUpdate(id, {age})
    const count = await User.countDocuments({age})
    return count
}

updateAgeAndCount('5cc9843ec66f3e87f0b68ac6', 25).then((count)=>{
    console.log(count)
}).catch((e)=>{
    console.log(e)
})

