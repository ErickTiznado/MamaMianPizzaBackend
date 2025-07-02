# 🐧 Comandos para verificar el servidor en Linux

## 1. Verificar si hay algo corriendo en el puerto 3001
```bash
netstat -tlnp | grep :3001
```

## 2. Verificar todos los procesos de Node.js
```bash
ps aux | grep node
```

## 3. Verificar qué puertos están ocupados por Node.js
```bash
lsof -i -P -n | grep node
```

## 4. Buscar cualquier proceso en puertos 3000-3010
```bash
netstat -tlnp | grep -E ":(300[0-9]|301[0-9])"
```

## 5. Si necesitas matar procesos en el puerto 3001
```bash
# Encontrar el PID
lsof -ti:3001

# Matar el proceso (reemplaza PID con el número que devuelve el comando anterior)
kill -9 PID
```

## 6. Para iniciar el servidor
```bash
# En el directorio del proyecto
cd /ruta/a/MamaMianPizzaBackend

# Instalar dependencias si es necesario
npm install

# Iniciar el servidor
npm start
# o
node server.js
```

## 7. Verificar logs del servidor mientras corre
```bash
# Si usas npm start
npm start 2>&1 | tee server.log

# Si usas node directamente
node server.js 2>&1 | tee server.log
```

## 8. Verificar variables de entorno
```bash
# Ver todas las variables de entorno
env | grep -E "(PORT|DB_|NODE_)"

# Ver el contenido del archivo .env si existe
cat .env
```

## Comandos más específicos:

### Verificar solo el puerto 3001:
```bash
sudo netstat -tlnp | grep :3001
```

### Ver todos los puertos de aplicaciones web comunes:
```bash
sudo netstat -tlnp | grep -E ":(80|443|3000|3001|8000|8080)"
```

### Monitorear en tiempo real:
```bash
watch "netstat -tlnp | grep :3001"
```
