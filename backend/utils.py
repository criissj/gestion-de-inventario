from models import db, ProductLog

def log_product_action(product_id, action, details):
    log = ProductLog(product_id=product_id, action=action, details=details)
    db.session.add(log)
