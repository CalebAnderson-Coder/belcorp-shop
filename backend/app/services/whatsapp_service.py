import requests
import logging
from typing import List
from ..models.models import Order, CartItem
from ..core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class WhatsAppService:
    def __init__(self):
        self.api_key = settings.WHATSAPP_API_KEY
        self.phone_number = settings.WHATSAPP_PHONE_NUMBER
        self.base_url = "https://graph.facebook.com/v17.0"

    def _format_order_message(self, order: Order) -> str:
        """Formatear el mensaje de la orden para WhatsApp"""
        message = f"¡Nuevo pedido de {order.customer_name}!\n\n"
        message += "Productos:\n"
        
        for item in order.items:
            message += f"- {item.quantity}x {item.product_id} (${item.price})\n"
        
        message += f"\nTotal: ${order.total}\n"
        
        if order.customer_address:
            message += f"\nDirección de entrega: {order.customer_address}"
        
        if order.notes:
            message += f"\nNotas: {order.notes}"
        
        return message

    def send_order_notification(self, order: Order) -> bool:
        """Enviar notificación de orden por WhatsApp"""
        try:
            if not self.api_key or not self.phone_number:
                logger.error("WhatsApp credentials not configured")
                return False

            message = self._format_order_message(order)
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "messaging_product": "whatsapp",
                "to": order.customer_phone,
                "type": "text",
                "text": {"body": message}
            }
            
            response = requests.post(
                f"{self.base_url}/{self.phone_number}/messages",
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                logger.info(f"WhatsApp notification sent successfully to {order.customer_phone}")
                return True
            else:
                logger.error(f"Failed to send WhatsApp notification: {response.text}")
                return False

        except Exception as e:
            logger.error(f"Error sending WhatsApp notification: {str(e)}")
            return False
