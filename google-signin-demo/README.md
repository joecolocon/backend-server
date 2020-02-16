# Google SignIn DEMO

Aplicación web node para hacer un login en google y obtener, por consola, el token de indentifcacion.

Se usan google services (node) para obtener un token de aplicación y poder registar/validar usuarios (seguridad) nediante OAUTH2.


uso de applicacion firebase  "loginApp"  -> ya usada en el curso angular de cero a experto -> mediante angular libraries.

## DATOS de configuración:
* Oauth2 feedback: http://localhost:3000/oauth2callback
* client id: 270080688754-iq4mrtj3jpt35k0crdfi4760ppi3elbq.apps.googleusercontent.com
* client secret: ByjG__V6lYQahTvmqiowJg8Q

* Configurado para permitir identificación desde http://localhost:3000 y http://localhost:4200


## Acceso a la configuración con google console:
* https://console.developers.google.com/apis/api/securetoken.googleapis.com/overview?authuser=0&project=loginapp-5d3ee

* habilitar Token Service API  ---> nombre del servicio securetoken.googleapis.com

## Ayuda al desarrollo
* https://developers.google.com/identity/toolkit/securetoken
