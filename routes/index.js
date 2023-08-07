const express = require('express')

const router = express.Router()

const URL = "https://api-eps-proyecto.vercel.app"
let currenUser = ""
function setUser(id){
    currenUser = id
}
router.get('/', (req, res) => res.render('index', { 'title': 'SI Nueva EPS' }))
router.get('/login', (req, res) => res.render('login', { 'title': 'Login SI Nueva EPS' }))
router.post('/login', (req, res) => {
    const { user, password } = req.body

    console.log(URL+"/doctors")
    fetch(URL+"/doctors")
        .then(resp => resp.json())
        .then(resp => {
            if (resp) {
                const exist = Array.from(resp.data).find(n => n.user === user && n.password === password)
                
                if (exist&&exist.rol == "admin") {
                    res.redirect('/admMain')
                } else {
                    if (exist) {
                        setUser(exist._id)

                        res.redirect('/doctorMain')
                    } else {
                        
                        res.redirect('/login')
                    }
                }
            } else {
                console.log('Ha surgido un error')

            }
        })
        .catch(err => {
            console.log(`Error ${err}`)

        })

})

router.get('/key', (req, res) => res.render('recoverKey', { 'title': 'Recuperar SI Nueva EPS' }))

router.get('/admMain', (req, res) => res.render('./administrator/main.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'admMain' }))
router.get('/managementDoctor', (req, res) => {
    const filtro = req.query.filtro;
    fetch(URL+"/doctors")
        .then(resp => resp.json())
        .then(resp => {
            if (resp) {
                let data = Array.from(resp.data);
                if (filtro || filtro === "") {
                    data = data.filter(dato => {
                        const valorFiltro = filtro?.toLocaleLowerCase();
                        return dato.name.toLowerCase().includes(valorFiltro) ||
                            dato.speciality.toLowerCase().includes(valorFiltro) ||
                            dato.documentId.toLowerCase().includes(valorFiltro) ||
                            dato.medicalRecord.toLowerCase().includes(valorFiltro);
                    });

                    res.render('./administrator/tablaDoctors', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': data, 'msg': '' })
                } else {
                    fetch(URL+"/specialities").then(resp2 => resp2.json())
                        .then(resp2 => {
                            if (resp2) {
                                //console.log(data.forEach(n=>console.log((n.speciality).name)))
                                let especialidades = resp2.data
                                res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': data, 'msg': '', "especialidades": especialidades })
                            }
                        })

                }
            } else {
                console.log('Ha surgido un error')

            }
        })
        .catch(err => {
            console.log(`Error ${err}`)

        })

})
router.post('/createDoctor', async (req, res) => {
    let { documentoIdentidad, nombre, registroMedico, especialidad, usuario, contrasena } = req.body


    fetch(URL+"/specialities").then(resp2 => resp2.json())
        .then(resp2 => {
            data = Array.from(resp2.data)

            if (resp2.state) {

                data.find(n => {
                    if ((n.name).includes(especialidad)) {

                        fetch(URL+"/doctors", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "documentId": documentoIdentidad,
                                "name": nombre,
                                "medicalRecord": registroMedico,
                                "user": usuario,
                                "password": contrasena,
                                "speciality": n._id
                            })
                        }).then(resp => resp.json())
                            .then(resp => {
                                fetch(URL+"/doctors")
                                    .then(resp3 => resp3.json())
                                    .then(resp3 => {

                                        if (resp.state) {

                                            res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor','msg': 'Creado exitosamente'})
                                        } else {

                                            res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor','msg': 'Un medico con la misma identificación ya existe'})
                                        }
                                    })
                                    .catch(err => {
                                        console.log(`Error ${err}`)

                                    })


                            }).catch(err => console.log(err))
                    }
                })
            }
            var especialidades = resp2.data


        }).catch(err => console.log(err))

})
router.post('/deleteDoctor', (req, res) => {
    const { documentoIdentidad } = req.body
    fetch(URL+"/doctors")
        .then(resp => resp.json())
        .then(resp => {
            let data = Array.from(resp.data)

            fetch(URL+"/specialities").then(resp3 => resp3.json())
                .then(resp3 => {
                    const finded = data.find(n => {
                        if (n.documentId == documentoIdentidad) {
                            fetch(URL+"/doctors/" + n._id, {
                                method: 'DELETE',
                            }).then(resp2 => resp2.json())
                                .then(resp2 => {
                                    if (resp2.state) {
                                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'msg': 'Eliminado exitosamente',})
                                        
                                    }
                                }).catch(err => console.log(err))
                                return n
                        }
                    })
                    console.log(finded)
                    if(!finded){
                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'msg': 'Médico no encontrado'})
                    }

                    
                    
                }).catch(err => console.log(err))

        })
        .catch(err => {
            console.log(`Error ${err}`)

        })


})
router.post('/updateDoctor', (req, res) => {
    const { documentoIdentidad, nombre, registroMedico, especialidad, usuario, contrasena } = req.body
    console.log(req.body)
    fetch(URL+"/doctors")
        .then(resp => resp.json())
        .then(resp => {
            const data = Array.from(resp.data)
            data.find(n => {
                fetch(URL+"/specialities").then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (n.documentId == documentoIdentidad) {
                            const esp = resp3.data.find(m => {
                                if ((m.name).includes(especialidad)) {
                                    return m._id
                                }
                            })
                            fetch(URL+"/doctors/" + n._id, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    "documentId": documentoIdentidad,
                                    "name": nombre,
                                    "medicalRecord": registroMedico,
                                    "user": usuario,
                                    "password": contrasena,
                                    "speciality": esp._id

                                })
                            }).then(resp2 => resp2.json())
                                .then(resp2 => {
                                    if (resp2.state) {
                                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'msg': 'Actualizado exitosamente'})
                                    } else {
                                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'msg': 'Médico no actualizado'})
                                    }
                                }).catch(err => console.log(err))
                        }
                    })
            })

        })
        .catch(err => {
            console.log(`Error ${err}`)

        })
})


router.get('/assigment', (req, res) => {
    res.render('./administrator/makeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'assigment', 'msg': '' })
})
router.get('/seeAsigment', (req, res) => {

    res.render('./administrator/seeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'seeAsigment', 'msg': '' })

})
router.post('/assignOffice', (req, res) => {
    const { documentoMedico, numeroConsultorio, fecha, turno } = req.body
    let inicio = ""
    let fin = ""
    if (turno == '8-13') {
        inicio = fecha + 'T' + "08:00:00.000Z"
        fin = fecha + 'T' + "13:00:00.000Z"
    } else {
        inicio = fecha + 'T' + "13:00:00.000Z"
        fin = fecha + 'T' + "20:00:00.000Z"
    }
    console.log(inicio + " " + fin)
    fetch(URL+'/offices').then(resp => resp.json())
        .then(resp => {
            if (resp.state) {
                fetch(URL+'/doctors').then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (resp3.state) {
                            resp3.data.find(n => {
                                if (n.documentId == documentoMedico) {
                                    resp.data.find(m => {
                                        if (m.numberOffice == numeroConsultorio) {
                                            fetch(URL+"/assigments/"+n._id+"&"+m._id, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    "date": fecha,
                                                    "inicio": inicio,
                                                    "fin": fin,
                                                    "documentDoctorId": n._id,
                                                    "idOffice":m._id
                                                })
                                            }).then(resp2=>resp2.json())
                                            .then(resp2 =>{
                                                console.log(resp2.state)
                                                if(resp2.state){
                                                    return res.render('./administrator/makeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'assigment',  'msg': 'Asignado satisfactoriamente'})
                                                    
                                                }else{
                                                    return res.render('./administrator/makeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'assigment', 'msg': 'Error al asignar, consultorio ocupado, médico ya asignado o revise los datos ingresados'})
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                           
                        } else {
                            
                            console.log('Error')
                        }
                        
                    })

            } else {
                console.log('Error')
            }

        })
        
})

router.get('/doctorMain', (req, res) => res.render('./doctor/main.ejs', { 'title': 'Médico SI Nueva EPS', 'currentPage': 'doctorMain' }))
router.get('/seeAsigment1', (req, res) => {

    res.render('./doctor/seeAssigment1.ejs', { 'title': 'Médico SI Nueva EPS', 'currentPage': 'seeAsigment1', 'doc': currenUser })

})

router.get('/appointments',(req,res) =>res.render('./administrator/setAppointment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'appointments', 'msg': ''}))
router.get('/seeAppointments', (req, res) => {

    res.render('./doctor/seeAppointments.ejs', { 'title': 'Médico SI Nueva EPS', 'currentPage': 'seeAppointments', 'doc': currenUser })

})

module.exports = router