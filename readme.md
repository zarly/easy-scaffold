
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
const <%- name %> = <%= value %>;

```
Конструкция <%- myVarName %> вставляет значение, эквивалентное myVarName.toString()
Конструкция <%= myVarName %> вставляет значение, эквивалентное JSON.stringify(myVarName)
Запускаем, указывая конфиг-файл первым аргументом, а переменные - именованными параметрами:
```
easy-scaffold ./templates/crud/index.js --name myVar --otherParam 123
```
Если переменные не указаны в параметрах запуска - они будут запрошены в командной строке

## Программный вызов

```
const scaffold = require('easy-scaffold');

scaffold('путь до конфиг-файла', {...параметры}, 'директория исполнения (опционально)')
    .then(() => console.log('Успешно'))
    .catch(e => console.error(e));
```

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
const camelCase = <%= someStr.camelCase %>;
const snakeCase = <%= someStr.snakeCase %>;
const kebabCase = <%= someStr.kebabCase %>;
const lowerCase = <%= someStr.lowerCase %>;
const upperCase = <%= someStr.upperCase %>;
const constCase = <%= someStr.constCase %>;
const classCase = <%= someStr.classCase %>;
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
