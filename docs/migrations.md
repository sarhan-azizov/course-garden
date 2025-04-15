# Руководство по использованию миграций

## Содержание
- [Введение](#введение)
- [Команды](#команды)
- [Примеры](#примеры)
- [Рабочий процесс](#рабочий-процесс)
- [Лучшие практики](#лучшие-практики)
- [Решение проблем](#решение-проблем)

## Введение

Миграции - это система контроля версий для базы данных. Они позволяют отслеживать, контролировать и применять изменения схемы базы данных. В нашем проекте используется TypeORM для управления миграциями.

## Команды

В проекте настроены следующие команды для работы с миграциями:

```bash
# Создать новую пустую миграцию
npm run migration:create

# Сгенерировать миграцию на основе изменений в entities
npm run migration:generate -- -d src/configs/data-source.ts

# Применить миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert

# Показать список миграций
npm run migration:show
```

## Примеры

### Пример 1: Создание новой таблицы

```typescript
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1234567890123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "users",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()"
                    }
                ]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }
}
```

### Пример 2: Добавление колонки

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUserRole1234567890124 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "users",
            new TableColumn({
                name: "role",
                type: "varchar",
                default: "'user'"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("users", "role");
    }
}
```

### Пример 3: Создание связей

```typescript
import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class AddUserPostsRelation1234567890125 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "posts",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("posts");
        const foreignKey = table.foreignKeys.find(
            fk => fk.columnNames.indexOf("user_id") !== -1
        );
        await queryRunner.dropForeignKey("posts", foreignKey);
    }
}
```

## Рабочий процесс

1. **Создание новой миграции:**
   ```bash
   npm run migration:create -- src/migrations/CreateUsers
   ```
   Создает пустой файл миграции для ручного заполнения.

2. **Генерация миграции из изменений:**
   ```bash
   npm run migration:generate -- src/migrations/AddUserRole
   ```
   Автоматически создает миграцию на основе изменений в entities.

3. **Применение миграций:**
   ```bash
   npm run migration:run
   ```
   Применяет все новые миграции.

4. **Откат миграции:**
   ```bash
   npm run migration:revert
   ```
   Откатывает последнюю примененную миграцию.

## Лучшие практики

1. **Именование миграций:**
   - Используйте понятные имена, описывающие изменения
   - Начинайте с глагола: Create, Add, Remove, Update
   - Пример: `CreateUsersTable`, `AddUserEmailColumn`

2. **Проверка миграций:**
   - Всегда проверяйте сгенерированный код
   - Убедитесь, что метод `down()` корректно отменяет изменения
   - Тестируйте миграции в dev-среде перед применением в production

3. **Версионирование:**
   - Никогда не изменяйте существующие миграции после их применения
   - Всегда коммитьте миграции в систему контроля версий
   - Создавайте новые миграции для исправления ошибок

4. **Безопасность:**
   - Проверяйте наличие данных перед их удалением
   - Используйте транзакции для сложных операций
   - Делайте бэкап базы данных перед применением миграций в production

## Решение проблем

### Распространенные ошибки

1. **Ошибка подключения к базе данных:**
   - Проверьте настройки в `src/config/data-source.ts`
   - Убедитесь, что база данных запущена
   - Проверьте права доступа

2. **Конфликты миграций:**
   - Проверьте таблицу `migrations` в базе данных
   - Убедитесь, что все разработчики применили миграции
   - При необходимости выполните откат конфликтующих миграций

3. **Ошибки при генерации:**
   - Проверьте синтаксис в entity файлах
   - Убедитесь, что все зависимости установлены
   - Проверьте права на запись в директорию миграций

### Отладка

1. **Просмотр статуса миграций:**
   ```sql
   SELECT * FROM migrations ORDER BY timestamp DESC;
   ```

2. **Логирование:**
   - Проверьте логи приложения
   - При необходимости увеличьте уровень логирования

3. **Откат к предыдущему состоянию:**
   - Используйте `migration:revert` для отката проблемных миграций
   - Восстановите базу данных из бэкапа при необходимости

## Дополнительные ресурсы

- [Официальная документация TypeORM по миграциям](https://typeorm.io/#/migrations)
- [Документация NestJS](https://docs.nestjs.com/techniques/database)
- [TypeORM CLI команды](https://typeorm.io/#/using-cli) 