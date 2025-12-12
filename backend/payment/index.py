import json
import os
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Создаёт платёж в Enot.io и возвращает ссылку для оплаты
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_str = event.get('body', '{}')
    if not body_str or body_str.strip() == '':
        body_str = '{}'
    
    body_data = json.loads(body_str)
    email = body_data.get('email', '')
    
    if not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email is required'}),
            'isBase64Encoded': False
        }
    
    shop_id = os.environ.get('ENOT_SHOP_ID')
    secret_key = os.environ.get('ENOT_SECRET_KEY')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Payment system not configured'}),
            'isBase64Encoded': False
        }
    
    # Генерируем уникальный order_id на основе email и времени
    import time
    order_id = f"frot_{int(time.time())}_{hash(email) % 100000}"
    amount = "20"
    currency = "RUB"
    
    # Создаём подпись для Enot.io
    # Формат: md5(shop_id:amount:secret_key:order_id)
    sign_string = f"{shop_id}:{amount}:{secret_key}:{order_id}"
    sign = hashlib.md5(sign_string.encode()).hexdigest()
    
    # Формируем URL для оплаты
    payment_url = (
        f"https://enot.io/pay?"
        f"m={shop_id}"
        f"&oa={amount}"
        f"&c={currency}"
        f"&o={order_id}"
        f"&s={sign}"
        f"&cr={currency}"
        f"&cf={email}"
    )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'payment_url': payment_url,
            'order_id': order_id
        }),
        'isBase64Encoded': False
    }
