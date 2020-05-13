// put in seperate file to keep main sequelize-auto clean
'use strict';

var Sequelize = require('sequelize');
var _ = Sequelize.Utils._;

function getModelFileStart(indentation, spaces, tableName, isV5) {
  var fileStart = "/* jshint indent: " + indentation + " */\n";
  fileStart += '// tslint:disable\n';
  fileStart += 'import * as sequelize from \'sequelize\';\n';
  fileStart += 'import {DataTypes} from \'sequelize\';\n';

  if( isV5 ) {
    fileStart += 'import {' + tableName + 'ModelStatic} from \'./db\';\n\n';
    fileStart += '// @ts-ignore\n';
    fileStart += "module.exports = function(sequelize: sequelize.Sequelize, DataTypes: DataTypes) {\n";
    fileStart += spaces + 'return <' + tableName + 'ModelStatic>sequelize.define(\'' + tableName + '\', {\n';
  } else {
    fileStart += 'import {' + tableName + 'Instance, ' + tableName + 'Attribute} from \'./db\';\n\n';
    fileStart += "module.exports = function(sequelize: sequelize.Sequelize, DataTypes: DataTypes) {\n";
    fileStart += spaces + 'return sequelize.define<' + tableName + 'Instance, ' + tableName + 'Attribute>(\'' + tableName + '\', {\n';
  }

  return fileStart;
}

function generateTableModels(tableNames, isSpaces, indentation, isCamelCase, isCamelCaseForFile, isV5 ) {
  var spaces = '';
  for (var i = 0; i < indentation; ++i) {
    spaces += (isSpaces === true ? ' ' : "\t");
  }

  return generateImports() + generateInterface() + generateTableMapper();

  function generateImports() {
    var fileTextOutput = '// tslint:disable\n';
    fileTextOutput += 'import * as path from \'path\';\n';
    fileTextOutput += 'import * as sequelize from \'sequelize\';\n';
    fileTextOutput += 'import * as def from \'./db\';\n\n';
    return fileTextOutput;
  }

  function generateInterface() {
    var fileTextOutput = 'export interface ITables {\n';
    for (var i = 0; i < tableNames.length; i++) {
      var table = isCamelCase ? _.camelCase(tableNames[i]) : tableNames[i];
      if( isV5 ) {
        fileTextOutput += spaces + table + ':def.' + table + 'ModelStatic;\n';
      } else {
        fileTextOutput += spaces + table + ':def.' + table + 'Model;\n';
      }
    }
    fileTextOutput += '}\n\n';
    return fileTextOutput;
  }

  function generateTableMapper() {
    var fileTextOutput = 'export const getModels = function(seq:sequelize.Sequelize):ITables {\n';
    fileTextOutput += spaces + 'const tables:ITables = {\n';
    for (var i = 0; i < tableNames.length; i++) {
      var tableForClass = isCamelCase ? _.camelCase(tableNames[i]) : tableNames[i];
      var tableForFile = isCamelCaseForFile ? _.camelCase(tableNames[i]) : tableNames[i];

      fileTextOutput += spaces + spaces + tableForClass + ': seq.import(path.join(__dirname, \'./' + tableForFile + '\')),\n';
    }
    fileTextOutput += spaces + '};\n';
    fileTextOutput += spaces + 'return tables;\n';
    fileTextOutput += '};\n';
    return fileTextOutput;
  }
}

exports.model = {
  getModelFileStart,
  generateTableModels
};

function getDefinitionFileStart() {
  return '// tslint:disable\nimport * as Sequelize from \'sequelize\';\n\n';
}

function getTableDefinition(tsTableDefAttr, tableName, isV5) {
  var tableDef = '\n// table: ' + tableName + '\n';

  if( isV5 ) { 
    tableDef += tsTableDefAttr + '\n}\n';
    tableDef += 'export type ' + tableName + 'ModelStatic = typeof Sequelize.Model & {\n';
    tableDef += '\tnew (values?: object, options?: Sequelize.BuildOptions): ' + tableName + 'Model;\n';
    tableDef += '}\n';
  } else {
    tableDef += tsTableDefAttr + '\n}\n';
    tableDef += 'export interface ' + tableName + 'Instance extends Sequelize.Instance<' + tableName + 'Attribute>, ' + tableName + 'Attribute { }\n';
    tableDef += 'export interface ' + tableName + 'Model extends Sequelize.Model<' + tableName + 'Instance, ' + tableName + 'Attribute> { }\n';
    tableDef += '}\n';
  }
  return tableDef;
}

// doing this in ts helper to not clutter up main index if statement
function getMemberDefinition(spaces, fieldName, val, allowNull) {
  if (fieldName === undefined) return '';
  var m = '\n' + spaces + fieldName + (allowNull === true ? '?:' : ':');

  if (val === undefined) {
    m += 'any';
  } else if (val.indexOf('DataTypes.BOOLEAN') > -1) {
    m += 'boolean';
  } else if (val.indexOf('DataTypes.INTEGER') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.BIGINT') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.STRING') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.CHAR') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.REAL') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.TEXT') > -1) {
    m += 'string';
  } else if (val.indexOf('DataTypes.DATE') > -1) {
    m += 'Date';
  } else if (val.indexOf('DataTypes.FLOAT') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.DECIMAL') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.DOUBLE') > -1) {
    m += 'number';
  } else if (val.indexOf('DataTypes.UUIDV4') > -1) {
    m += 'string';
  } else {
    m += 'any';
  }

  return m + ';';
}

exports.def = {
  getDefinitionFileStart,
  getTableDefinition,
  getMemberDefinition
};
