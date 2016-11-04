"use strict";

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Word', {
    word: { type: DataTypes.STRING, unique: true },
    count: { type: DataTypes.INTEGER, defaultValue: 0 }
  });
};