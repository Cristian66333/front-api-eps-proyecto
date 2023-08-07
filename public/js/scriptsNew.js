function eliminarAsignacion(id) {
    const resultado = confirm('¿Estás seguro de que deseas eliminar esta asignación?');
    if (resultado) {
        fetch("https://api-eps-proyecto.vercel.app/assigments/" + id, {
            method: 'DELETE'
        }).then(resp => resp.json())
            .then(resp => {
                if (resp.state) {
                    alert('Asignación Eliminada')
                    location.href = '/assigment'
                } else {
                    alert('Asignación no se pudo eliminar')
                }

            })
    }

}

function eliminarCita(id) {
    const resultado = confirm('¿Estás seguro de que deseas eliminar esta cita?');
    if (resultado) {
        fetch("https://api-eps-proyecto.vercel.app/appointments/" + id, {
            method: 'DELETE'
        }).then(resp => resp.json())
            .then(resp => {
                if (resp.state) {
                    alert('Cita Eliminada')
                    location.href = '/appointments'
                } else {
                    console.log(resp.data)
                    alert('Cita no se pudo eliminar')
                }

            })
    }

}
function searchPatient() {
    var docPatient = document.getElementById('documentoPaciente').value
    var namePatient = document.getElementById('nombrePaciente')
    namePatient.innerText = ""
    fetch("https://api-eps-proyecto.vercel.app/patients").then(resp => resp.json())
        .then(resp => {
            resp.data.forEach(n => {

                if (n.documentId === docPatient) {
                    console.log('Entra')

                    namePatient.innerHTML = '<h6>' + n.name + '</h6>'


                }

            });

        })
    //alert('paciente no encontrado')


}

function changeDoctors() {
    var selectEspecialidad = document.getElementById('nombreEspecialidad').value
    var select = document.getElementById('nombreMedico')
    select.innerHTML = ""
    fetch("https://api-eps-proyecto.vercel.app/doctors").then(resp => resp.json())
        .then(resp => {
            var option0 = document.createElement('option')
            option0.append(document.createTextNode('Seleccione El médico..'))
            select.append(option0)
            resp.data.forEach(n => {
                if (n.speciality) {
                    if (n.speciality.name == selectEspecialidad) {
                        var option = document.createElement('option')
                        option.append(document.createTextNode(n.name))
                        option.value = n._id
                        select.append(option)
                    }
                }
            })
        })
}

function showDates() {
    var selectNombre = document.getElementById('nombreMedico').value
    var select = document.getElementById('fecha')
    select.innerHTML = ""
    fetch("https://api-eps-proyecto.vercel.app/assigments").then(resp => resp.json())
        .then(resp => {
            var option0 = document.createElement('option')
            option0.append(document.createTextNode('Seleccione la Fecha...'))
            select.append(option0)
            resp.data.forEach(n => {

                if (n.documentDoctorId._id === selectNombre) {
                    console.log(n.documentDoctorId._id + ' ' + selectNombre)
                    var option = document.createElement('option')
                    var fecha = n.date.split('T')[0]
                    option.append(document.createTextNode(fecha))
                    option.value = n._id
                    select.append(option)
                }
            })
        })
}

function changeHours() {
    var selectFecha = document.getElementById('fecha').value
    var select = document.getElementById('hora')
    select.innerHTML = ""
    fetch("https://api-eps-proyecto.vercel.app/assigments").then(resp => resp.json())
        .then(resp => {
            console.log(document.getElementById('fecha'))
            var option0 = document.createElement('option')
            option0.append(document.createTextNode('Seleccione la Fecha...'))
            select.append(option0)
            resp.data.forEach(n => {
                var fecha2 = n.inicio.split('T')[1].substring(0, 5);
                if (fecha2 == '08:00') {
                    var hours = 8
                    var minutes = 0
                    var limite = 20
                } else {
                    var hours = 13
                    var minutes = 0
                    var limite = 28
                }
                if (n._id == selectFecha) {
                    for (let i = 0; i < limite; i++) {
                        var option = document.createElement('option')
                        option.append(document.createTextNode(hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')))
                        select.append(option)
                        minutes += 15
                        if (minutes == 60) {
                            hours++
                            minutes = 0
                        }

                    }

                }
            })
        })
}

function saveCita() {
    var docPatient = document.getElementById('documentoPaciente').value
    var selectFecha = document.getElementById('fecha')
    
    var select = document.getElementById('hora').value
    if (docPatient != '') {
        var selected = selectFecha.options[selectFecha.selectedIndex].text;
        fetch("https://api-eps-proyecto.vercel.app/patients").then(resp => resp.json())
            .then(resp => {
                resp.data.forEach(n => {
                    if (n.documentId == docPatient) {
                        fetch("https://api-eps-proyecto.vercel.app/appointments/"+n._id+"&"+selectFecha.value, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "date": selected + 'T' + select + ':00.000Z'
                            })
                        }).then(resp => resp.json())
                            .then(resp => {
                                if (resp.state) {
                                    alert('agregado exitosamente')
                                    location.href="appointments"
                                } else {
                                    alert('No agregado, revise las entradas')
                                }
                            })
                    }
                })
            })
    }else{
        alert('Revise las entradas')
    }

}
