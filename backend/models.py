from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(100), unique=True)
    cost = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'sku': self.sku,
            'cost': self.cost,
            'price': self.price,
            'stock': self.stock,
            'is_active': self.is_active
        }

class ProductLog(db.Model):
    __tablename__ = 'product_logs'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    action = db.Column(db.String(50), nullable=False) # CREATE, UPDATE, DELETE, SALE, RESTOCK
    details = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'action': self.action,
            'details': self.details,
            'timestamp': self.timestamp.isoformat()
        }

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    date_time = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False)
    total_profit = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False, default='Cash') # Cash, Card, Transfer
    items = db.relationship('SaleItem', backref='sale', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'date_time': self.date_time.isoformat(),
            'total_amount': self.total_amount,
            'total_profit': self.total_profit,
            'payment_method': self.payment_method,
            'items': [item.to_dict() for item in self.items]
        }

class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_sale = db.Column(db.Float, nullable=False)
    cost_at_sale = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'product_id': self.product_id,
            'quantity': self.quantity,
            'price': self.price_at_sale,
            'cost': self.cost_at_sale
        }
