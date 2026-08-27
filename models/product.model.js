const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    price: { type: DataTypes.INTEGER, allowNull: false }, // rupiah, tanpa desimal
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    category: { type: DataTypes.STRING, defaultValue: 'Umum' }, // dipake buat filter & badge kategori
  },
  { tableName: 'products', timestamps: true }
);

module.exports = Product;