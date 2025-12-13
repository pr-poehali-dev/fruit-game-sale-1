import json
import os
import hashlib
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Webhook для подтверждения оплаты от Enot.io.
    Сохраняет данные о покупке в БД и возвращает OK.
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
    
    # Получаем данные от Enot.io
    body_str = event.get('body', '{}')
    params = event.get('queryStringParameters', {})
    
    # Enot.io отправляет данные в query параметрах
    merchant_id = params.get('merchant_id', params.get('m', ''))
    amount = params.get('amount', params.get('oa', ''))
    order_id = params.get('merchant_order_id', params.get('o', ''))
    sign_received = params.get('sign', params.get('s', ''))
    email = params.get('custom_field', params.get('cf', ''))
    
    secret_key = os.environ.get('ENOT_SECRET_KEY', '')
    
    # Проверяем подпись
    sign_string = f"{merchant_id}:{amount}:{secret_key}:{order_id}"
    sign_calculated = hashlib.md5(sign_string.encode()).hexdigest()
    
    if sign_calculated != sign_received:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
            'body': 'Invalid signature',
            'isBase64Encoded': False
        }
    
    # Сохраняем покупку в БД
    try:
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        cur.execute("""
            INSERT INTO purchases (order_id, email, amount, created_at)
            VALUES (%s, %s, %s, NOW())
            ON CONFLICT (order_id) DO NOTHING
        """, (order_id, email, amount))
        
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        # Если БД недоступна, всё равно подтверждаем платёж
        pass
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'},
        'body': 'OK',
        'isBase64Encoded': False
    }
