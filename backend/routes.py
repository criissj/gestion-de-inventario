from flask import Blueprint, request, jsonify
from models import db, Product, Sale, SaleItem, ProductLog
from datetime import datetime, timedelta
from sqlalchemy import func

api_bp = Blueprint('api', __name__)

# --- Helper Functions ---
def log_product_action(product_id, action, details):
    log = ProductLog(product_id=product_id, action=action, details=details)
    db.session.add(log)

# --- Product Routes ---

@api_bp.route('/products', methods=['GET'])
def get_products():
    # Only return active products by default
    products = Product.query.filter_by(is_active=True).order_by(Product.id).all()
    return jsonify([p.to_dict() for p in products])

@api_bp.route('/products', methods=['POST'])
def create_product():
    data = request.json
    new_product = Product(
        name=data['name'],
        category=data['category'],
        sku=data.get('sku'),
        cost=data['cost'],
        price=data['price'],
        stock=data.get('stock', 0)
    )
    db.session.add(new_product)
    db.session.flush() # Get ID
    
    log_product_action(new_product.id, 'CREATE', f"Created product: {new_product.name}, Stock: {new_product.stock}")
    
    db.session.commit()
    return jsonify(new_product.to_dict()), 201

@api_bp.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    
    changes = []
    if data.get('price') != product.price:
        changes.append(f"Price: {product.price} -> {data['price']}")
    if data.get('stock') != product.stock:
        changes.append(f"Stock: {product.stock} -> {data['stock']}")
    if data.get('cost') != product.cost:
        changes.append(f"Cost: {product.cost} -> {data['cost']}")
        
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category)
    product.sku = data.get('sku', product.sku)
    product.cost = data.get('cost', product.cost)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    
    if changes:
        log_product_action(id, 'UPDATE', ", ".join(changes))
    
    db.session.commit()
    return jsonify(product.to_dict())

@api_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    product.is_active = False # Soft Delete
    log_product_action(id, 'DELETE', "Product marked as inactive (Soft Delete)")
    db.session.commit()
    return jsonify({'message': 'Product deactivated'})

@api_bp.route('/products/<int:id>/logs', methods=['GET'])
def get_product_logs(id):
    logs = ProductLog.query.filter_by(product_id=id).order_by(ProductLog.timestamp.desc()).all()
    return jsonify([l.to_dict() for l in logs])

# --- Sales Routes ---

@api_bp.route('/sales', methods=['POST'])
def create_sale():
    data = request.json
    items_data = data['items']
    payment_method = data.get('payment_method', 'Cash')
    
    total_amount = 0
    total_profit = 0
    
    sale_items_objects = []
    
    for item in items_data:
        product = Product.query.get(item['product_id'])
        if not product:
            continue 
            
        qty = item['quantity']
        price = product.price
        cost = product.cost
        
        line_total = price * qty
        line_profit = (price - cost) * qty
        
        total_amount += line_total
        total_profit += line_profit
        
        sale_item = SaleItem(
            product_id=product.id,
            quantity=qty,
            price_at_sale=price,
            cost_at_sale=cost
        )
        sale_items_objects.append(sale_item)
        
        # Log stock change
        log_product_action(product.id, 'SALE', f"Sold {qty} units via {payment_method}")

    new_sale = Sale(
        total_amount=total_amount, 
        total_profit=total_profit,
        payment_method=payment_method
    )
    db.session.add(new_sale)
    db.session.flush()
    
    for item in sale_items_objects:
        item.sale_id = new_sale.id
        db.session.add(item)
        
    db.session.commit()
    
    return jsonify(new_sale.to_dict()), 201

@api_bp.route('/sales', methods=['GET'])
def get_sales():
    sales = Sale.query.order_by(Sale.date_time.desc()).all()
    return jsonify([s.to_dict() for s in sales])

# --- Dashboard & Analytics Routes ---

@api_bp.route('/dashboard', methods=['GET'])
def get_dashboard_stats():
    today = datetime.utcnow().date()
    
    # Daily Stats
    sales_today = Sale.query.filter(Sale.date_time >= today).all()
    total_sales_today = sum(s.total_amount for s in sales_today)
    total_profit_today = sum(s.total_profit for s in sales_today)
    
    # Low Stock Alerts (Stock < 10)
    low_stock_products = Product.query.filter(Product.stock < 10, Product.is_active == True).limit(5).all()
    
    # Top Selling Products (Simple count for now, could be optimized with aggregation)
    # Using SQL Alchemy for aggregation
    top_products_query = db.session.query(
        Product.name, func.sum(SaleItem.quantity).label('total_qty')
    ).join(SaleItem, Product.id == SaleItem.product_id)\
     .group_by(Product.name)\
     .order_by(func.sum(SaleItem.quantity).desc())\
     .limit(5).all()
     
    top_products = [{'name': name, 'quantity': qty} for name, qty in top_products_query]

    return jsonify({
        'total_sales_today': total_sales_today,
        'total_profit_today': total_profit_today,
        'transaction_count': len(sales_today),
        'low_stock_products': [p.to_dict() for p in low_stock_products],
        'top_selling_products': top_products
    })

@api_bp.route('/sales/trends', methods=['GET'])
def get_sales_trends():
    # Last 7 days sales
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=6)
    
    results = db.session.query(
        func.date(Sale.date_time).label('date'),
        func.sum(Sale.total_amount).label('total')
    ).filter(Sale.date_time >= start_date)\
     .group_by(func.date(Sale.date_time))\
     .order_by(func.date(Sale.date_time)).all()
     
    # Fill in missing dates
    data = {}
    for r in results:
        data[str(r.date)] = r.total
        
    full_data = []
    for i in range(7):
        date = (start_date + timedelta(days=i)).date()
        date_str = str(date)
        full_data.append({
            'date': date.strftime('%a'), # Mon, Tue, etc.
            'total': data.get(date_str, 0)
        })
        
    return jsonify(full_data)
