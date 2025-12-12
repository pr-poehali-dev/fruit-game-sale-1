import json
import os
import uuid
from typing import Dict, Any
import requests
from base64 import b64encode

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Создаёт платёж в ЮKassa и возвращает ссылку для оплаты
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
    
    shop_id = os.environ.get('YOOKASSA_SHOP_ID')
    secret_key = os.environ.get('YOOKASSA_SECRET_KEY')
    
    if not shop_id or not secret_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Payment system not configured'}),
            'isBase64Encoded': False
        }
    
    idempotence_key = str(uuid.uuid4())
    
    auth_string = f"{shop_id}:{secret_key}"
    auth_header = b64encode(auth_string.encode()).decode()
    
    payment_data = {
        "amount": {
            "value": "20.00",
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": event.get('headers', {}).get('origin', 'https://example.com')
        },
        "capture": True,
        "description": "Покупка игры Frot",
        "receipt": {
            "customer": {
                "email": email
            },
            "items": [{
                "description": "Игра Frot",
                "quantity": "1",
                "amount": {
                    "value": "20.00",
                    "currency": "RUB"
                },
                "vat_code": 1
            }]
        }
    }
    
    try:
        response = requests.post(
            'https://api.yookassa.ru/v3/payments',
            json=payment_data,
            headers={
                'Authorization': f'Basic {auth_header}',
                'Idempotence-Key': idempotence_key,
                'Content-Type': 'application/json'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'payment_url': result['confirmation']['confirmation_url'],
                    'payment_id': result['id']
                }),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': response.status_code,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Payment creation failed', 'details': response.text}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }