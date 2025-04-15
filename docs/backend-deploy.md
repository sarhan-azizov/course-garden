# Процесс деплоя бэкенда

## Обзор
Данный документ описывает автоматизированный процесс деплоя бэкенда через GitHub Actions. Деплой запускается автоматически при каждом push в ветку `main`.

## Предварительные требования

### На GitHub
1. Настроенные Secrets:
   - `USERNAME` - имя пользователя для SSH
   - `KEY` - SSH ключ для доступа к серверу
   - `JWT_SECRET` - секретный ключ для JWT
   - `POSTGRESQL_PASSWORD` - пароль для PostgreSQL
   - `SEND_GRID_KEY` - ключ SendGrid
   - `ADMIN_EMAIL` - email администратора
   - `ADMIN_PASSWORD` - пароль администратора
   - `BCRYPT_SALT` - соль для bcrypt
   - `AUTH0_ISSUER_BASE_URL` - URL Auth0
   - `AUTH0_AUDIENCE` - аудитория Auth0
   - `AUTH0_CLIENT_ORIGIN_URL` - URL клиента Auth0
   - `AWS_ACCESS_KEY_ID` - ID ключа AWS
   - `AWS_SECRET_ACCESS_KEY` - секретный ключ AWS
   - `AWS_BUCKET_REGION` - регион AWS бакета
   - `AWS_BUCKET_NAME` - имя AWS бакета

2. Настроенные Variables:
   - `HOST` - адрес сервера
   - `POSTGRESQL_DBNAME` - имя базы данных
   - `POSTGRESQL_HOST` - хост PostgreSQL
   - `POSTGRESQL_PORT` - порт PostgreSQL
   - `POSTGRESQL_USERNAME` - имя пользователя PostgreSQL
   - `NODE_ENV` - окружение Node.js

### На сервере
1. Установленный Docker и Docker Compose
2. Настроенный SSH доступ
3. Настроенный Git с доступом к репозиторию
4. Директория `project` с клонированным репозиторием

## Процесс деплоя

### 1. Триггер
Деплой запускается автоматически при:
- Push в ветку `main`

### 2. Этапы деплоя

#### 2.1. Подготовка на GitHub Actions
```yaml
- uses: actions/checkout@v3
```
GitHub Actions получает код из репозитория во временное рабочее пространство.

#### 2.2. SSH подключение
Используется action `appleboy/ssh-action@master` для подключения к серверу с параметрами:
- Хост: `${{ vars.HOST }}`
- Пользователь: `${{ secrets.USERNAME }}`
- SSH ключ: `${{ secrets.KEY }}`
- Порт: 22
- Таймаут: 30 минут

#### 2.3. Обновление кода на сервере
```bash
cd project
git pull git@github.com:UPCoD-UNKD/proj-coursegarden.git main
cd backend
```

#### 2.4. Настройка окружения
Создается файл `.env` со всеми необходимыми переменными окружения:
- Параметры JWT
- Настройки базы данных
- Параметры Auth0
- Настройки AWS
- Учетные данные администратора
- Прочие конфигурационные параметры

#### 2.5. Запуск приложения
```bash
# Остановка текущих контейнеров
docker compose -f "docker-compose.yml" down

# Сборка и запуск новых контейнеров
docker compose -f "docker-compose.yml" up -d --build

# Очистка неиспользуемых ресурсов
docker system prune -af --volumes

# Проверка статуса
docker ps -a
```

## Мониторинг и отладка

### Логи
- GitHub Actions: доступны в разделе "Actions" репозитория
- Docker: `docker logs <container_name>`
- Приложение: внутри Docker контейнера

### Проверка статуса
```bash
# Статус контейнеров
docker ps -a

# Использование ресурсов
docker stats
```

## Откат изменений
В случае проблем:
1. Переключиться на предыдущую версию в Git
2. Перезапустить контейнеры
```bash
git checkout <previous_commit>
docker compose down
docker compose up -d --build
```

## Безопасность
- Все чувствительные данные хранятся в GitHub Secrets
- Используется SSH аутентификация
- Применяется HTTPS для всех внешних соединений
- Настроен SSL для базы данных

## Поддержка
При возникновении проблем:
1. Проверить логи GitHub Actions
2. Проверить логи Docker контейнеров
3. Проверить статус сервисов на сервере
4. Проверить корректность переменных окружения

graph TD
    A[Разработчик делает push в main] --> B[Запускается GitHub Action]
    B --> C[actions/checkout@v3 клонирует код на runner]
    C --> D[SSH подключение к серверу]
    D --> E[git pull обновляет код на сервере]
    E --> F[Сборка и запуск приложения]