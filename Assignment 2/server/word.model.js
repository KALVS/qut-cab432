"use strict";

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Word', {
    word: DataTypes.STRING,
    count: DataTypes.NUMBER
  });
};
