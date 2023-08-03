const express = require('express')

const router = express.Router()

const URL = 'https://api-eps.vercel.app/doctors'
let currenUser = ""
function setUser(id){
    currenUser = id
}
router.get('/', (req, res) => res.render('index', { 'title': 'SI Nueva EPS' }))
router.get('/login', (req, res) => res.render('login', { 'title': 'Login SI Nueva EPS' }))
router.post('/login', (req, res) => {
    const { user, password } = req.body


    fetch("https://api-eps.vercel.app/doctors")
        .then(resp => resp.json())
        .then(resp => {
            if (resp) {
                const exist = Array.from(resp.data).find(n => n.user === user && n.password === password)
                if (exist.rol == "admin") {
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
    fetch("https://api-eps.vercel.app/doctors")
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
                    fetch("https://api-eps.vercel.app/specialities").then(resp2 => resp2.json())
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


    fetch("https://api-eps.vercel.app/specialities").then(resp2 => resp2.json())
        .then(resp2 => {
            data = Array.from(resp2.data)

            if (resp2.state) {

                data.find(n => {
                    if ((n.name).includes(especialidad)) {
                        fetch("https://api-eps.vercel.app/doctors", {
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
                                fetch("https://api-eps.vercel.app/doctors")
                                    .then(resp3 => resp3.json())
                                    .then(resp3 => {

                                        if (resp.state) {

                                            res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': resp3.data, 'msg': 'Creado exitosamente', "especialidades": especialidades })
                                        } else {

                                            res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': resp3.data, 'msg': 'Un medico con la misma identificación ya existe', "especialidades": especialidades })
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
    fetch("https://api-eps.vercel.app/doctors")
        .then(resp => resp.json())
        .then(resp => {
            const data = Array.from(resp.data)

            fetch("https://api-eps.vercel.app/specialities").then(resp3 => resp3.json())
                .then(resp3 => {
                    data.find(n => {
                        if (n.documentId == documentoIdentidad) {
                            fetch("https://api-eps.vercel.app/doctors/" + n._id, {
                                method: 'DELETE',
                            }).then(resp2 => resp2.json())
                                .then(resp2 => {

                                    console.log(resp2.state)
                                    if (resp2.state) {
                                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': resp.data, 'msg': 'Eliminado exitosamente', "especialidades": resp3.data })
                                    }
                                }).catch(err => console.log(err))

                        }
                    })
                    res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': resp.data, 'msg': 'Médico no encontrado', "especialidades": resp3.data })
                }).catch(err => console.log(err))

        })
        .catch(err => {
            console.log(`Error ${err}`)

        })


})
router.post('/updateDoctor', (req, res) => {
    const { documentoIdentidad, nombre, registroMedico, especialidad, usuario, contrasena } = req.body
    fetch("https://api-eps.vercel.app/doctors")
        .then(resp => resp.json())
        .then(resp => {
            const data = Array.from(resp.data)
            data.find(n => {
                fetch("https://api-eps.vercel.app/specialities").then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (n.documentId == documentoIdentidad) {
                            const esp = resp3.data.find(m => {
                                if ((m.name).includes(especialidad)) {
                                    return m._id
                                }
                            })
                            fetch("https://api-eps.vercel.app/doctors/" + n._id, {
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
                                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': resp.data, 'msg': 'Actualizado exitosamente', "especialidades": resp3.data })
                                    } else {
                                        res.render('./administrator/medicalManagement.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'managementDoctor', 'data': resp.data, 'msg': 'Médico no actualizado', "especialidades": resp3.data })
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
    const filtro = req.query.filtro;

    fetch('https://api-eps.vercel.app/offices').then(resp => resp.json())
        .then(resp => {
            if (resp.state) {
                fetch('https://api-eps.vercel.app/doctors').then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (resp3.state) {
                            let dataOffices = Array.from(resp.data);
                            if (filtro || filtro === "") {
                                dataOffices = dataOffices.filter(dato => {

                                    return dato.assignments.find(n => {
                                        const valorFiltro = filtro?.toLocaleLowerCase();
                                        return resp3.data.find(m => {
                                            if (m.documentId == n.documentDoctorId) {
                                                return dato.floor.toString().toLowerCase().includes(valorFiltro) || dato.numberOffice.toLowerCase().includes(valorFiltro)
                                                    || m.name.toLowerCase().includes(filtro) ? true : false || m.speciality.toLowerCase().includes(filtro) ? true : false
                                                        || n.documento_medico.includes(filtro) ? true : false || n.date.includes(filtro) ? true : false
                                            }

                                        })


                                    })


                                });
                                res.render('./administrator/tablaOffices', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'seeAsigment', 'data': dataOffices, 'dataMedico': resp3.data, 'msg': '' })
                            } else {
                                res.render('./administrator/makeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'assigment', 'data': dataOffices, 'dataMedico': resp3.data, 'msg': '', 'consultorios': resp.data })
                            }
                        } else {
                            console.log('Error')
                        }
                    })

            } else {
                console.log('Error')
            }

        })

})
router.get('/seeAsigment', (req, res) => {
    const filtro = req.query.filtro;

    fetch('https://api-eps.vercel.app/offices').then(resp => resp.json())
        .then(resp => {
            if (resp.state) {
                fetch('https://api-eps.vercel.app/doctors').then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (resp3.state) {
                            let dataOffices = Array.from(resp.data);
                            if (filtro || filtro === "") {
                                dataOffices = dataOffices.filter(dato => {

                                    return dato.assignments.find(n => {
                                        const valorFiltro = filtro?.toLocaleLowerCase();
                                        return resp3.data.find(m => {
                                            if (m.documentId == n.documentDoctorId) {
                                                return dato.floor.toString().toLowerCase().includes(valorFiltro) || dato.numberOffice.toLowerCase().includes(valorFiltro)
                                                    || m.name.toLowerCase().includes(filtro) ? true : false || m.speciality.toLowerCase().includes(filtro) ? true : false
                                                        || n.documento_medico.includes(filtro) ? true : false || n.date.includes(filtro) ? true : false
                                            }

                                        })


                                    })


                                });
                                res.render('./administrator/tablaOffices', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'seeAsigment', 'data': dataOffices, 'dataMedico': resp3.data, 'msg': '' })
                            } else {
                                res.render('./administrator/seeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'seeAsigment', 'data': dataOffices, 'dataMedico': resp3.data, 'msg': '' })
                            }
                        } else {
                            console.log('Error')
                        }
                    })

            } else {
                console.log('Error')
            }

        })

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
    fetch('https://api-eps.vercel.app/offices').then(resp => resp.json())
        .then(resp => {
            if (resp.state) {
                fetch('https://api-eps.vercel.app/doctors').then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (resp3.state) {
                            resp3.data.find(n => {
                                if (n.documentId == documentoMedico) {
                                    resp.data.find(m => {
                                        if (m.numberOffice == numeroConsultorio) {
                                            fetch("https://api-eps.vercel.app/assigments/"+n._id+"&"+m._id, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    "date": fecha,
                                                    "inicio": inicio,
                                                    "fin": fin,
                                                    "documentDoctorId": n._id,
                                                })
                                            }).then(resp2=>resp2.json())
                                            .then(resp2 =>{
                                                console.log(resp2.state)
                                                if(resp2.state){
                                                    return res.render('./administrator/makeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'assigment', 'data': resp.data, 'dataMedico': resp3.data, 'msg': 'Asignado satisfactoriamente', 'consultorios': resp.data })
                                                    
                                                }else{
                                                    return res.render('./administrator/makeAssignment.ejs', { 'title': 'Administrador SI Nueva EPS', 'currentPage': 'assigment', 'data': resp.data, 'dataMedico': resp3.data, 'msg': 'Error al asignar, consultorio ocupado, médico ya asignado o revise los datos ingresados', 'consultorios': resp.data })
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
    const filtro = req.query.filtro;
    fetch('https://api-eps.vercel.app/offices').then(resp => resp.json())
        .then(resp => {
            if (resp.state) {
                fetch('https://api-eps.vercel.app/doctors').then(resp3 => resp3.json())
                    .then(resp3 => {
                        if (resp3.state) {
                            let dataOffices = Array.from(resp.data);
                            if (filtro || filtro === "") {
                                dataOffices = dataOffices.filter(dato => {

                                    return dato.assignments.find(n => {
                                        const valorFiltro = filtro?.toLocaleLowerCase();
                                        return resp3.data.find(m => {
                                            if (m.documentId == n.documentDoctorId) {
                                                return dato.floor.toString().toLowerCase().includes(valorFiltro) || dato.numberOffice.toLowerCase().includes(valorFiltro)
                                                    || m.name.toLowerCase().includes(filtro) ? true : false || m.speciality.toLowerCase().includes(filtro) ? true : false
                                                        || n.documento_medico.includes(filtro) ? true : false || n.date.includes(filtro) ? true : false
                                            }

                                        })


                                    })


                                });

                                res.render('./doctor/tableDoctor.ejs', { 'title': 'Médico SI Nueva EPS', 'currentPage': 'seeAsigment1', 'data': resp.data, 'doc': currenUser })
                            } else {

                                res.render('./doctor/seeAssigment1.ejs', { 'title': 'Médico SI Nueva EPS', 'currentPage': 'seeAsigment1', 'data': resp.data, 'doc': currenUser })
                            }
                        } else {
                            console.log('Error')
                        }
                    })

            } else {
                console.log('Error')
            }

        })

})

module.exports = router