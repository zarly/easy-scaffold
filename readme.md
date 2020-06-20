
# Easy Scaffold

Простой инструмент для кодогенерации

## Установка

```
npm install -g easy-scaffold
```

## Использование

Создаём конфиг-файл:
```
exports.getConfig = function getConfig (args) {
    return {
        entities: [
            { input: './template.ejs', output: '@/result.txt' },
        ],
    };
};
```
Создаём один или несколько шаблонов в формате ejs:
```
const <%= name %> = <%= value %>;

```
Запускаем, указывая конфиг-файл первым аргументом, а переменные - именованными параметрами:
```
easy-scaffold ./templates/crud/index.js --name myVar --otherParam 123
```
Если переменные не указаны в параметрах запуска - они будут запрошены в командной строке

## Дополнительные возможности

В конфиг-файле можно указать преобразователь данных:
```
exports.getConfig = function getConfig (args) {
    return {
        entities: [
            { input: './template.ejs', output: '@/result.txt' },
        ],
        data: function data () {
            return {
                full_name: args.first_name + ' ' + args.last_name,
                ...args
            };
        },
    };
};
```

В шаблонах и конфиге у любой переменной есть свойства для преобразования кейсов. Например, такой шаблон:
```
const camelCase = "<%= someStr.camelCase %>";
const snakeCase = "<%= someStr.snakeCase %>";
const kebabCase = "<%= someStr.kebabCase %>";
const lowerCase = "<%= someStr.lowerCase %>";
const upperCase = "<%= someStr.upperCase %>";
const constCase = "<%= someStr.constCase %>";
const classCase = "<%= someStr.classCase %>";
```
вернёт такой результат:
```
const camelCase = "someValueEee";
const snakeCase = "some_value_eee";
const kebabCase = "some-value-eee";
const lowerCase = "some value eee";
const upperCase = "SOME VALUE EEE";
const constCase = "SOME_VALUE_EEE";
const classCase = "SomeValueEee";
```

### P.S.

Проект создан за один вечер, просто из спортивного интереса, и вряд ли будет поддерживаться. Если вы хотите что-то в нём поменять или добавить - создавайте пулл-реквест или форк. Фича-реквесты без решающих пулл-реквестов игнорируются.
