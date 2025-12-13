import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const DOWNLOAD_API = 'https://functions.poehali.dev/TO_BE_REPLACED';

export default function Success() {
  const [searchParams] = useSearchParams();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      setError('Не найден ID заказа');
      setIsLoading(false);
      return;
    }

    // Получаем ссылку на скачивание
    fetch(`${DOWNLOAD_API}?order_id=${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.download_url) {
          setDownloadUrl(data.download_url);
          // Автоматически начинаем скачивание
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = data.download_url;
            link.download = 'frot-game.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast({
              title: 'Скачивание началось!',
              description: 'Файл игры загружается на ваше устройство',
            });
          }, 1000);
        } else {
          setError('Не удалось получить ссылку на скачивание');
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError('Ошибка при получении файла');
        setIsLoading(false);
      });
  }, [searchParams, toast]);

  const handleManualDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {isLoading ? (
          <>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Icon name="Download" size={32} className="text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Подготовка скачивания...</h1>
            <p className="text-muted-foreground">Проверяем оплату и готовим файлы</p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertCircle" size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Вернуться на главную
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle2" size={32} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Оплата успешна!</h1>
            <p className="text-muted-foreground mb-6">
              Скачивание начнётся автоматически через несколько секунд
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={handleManualDownload}
                className="w-full"
                size="lg"
              >
                <Icon name="Download" size={20} className="mr-2" />
                Скачать игру вручную
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Вернуться на главную
              </Button>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg text-sm text-left">
              <p className="font-semibold mb-2 flex items-center">
                <Icon name="Info" size={16} className="mr-2" />
                Что дальше?
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li>1. Распакуйте ZIP-архив</li>
                <li>2. Запустите файл игры</li>
                <li>3. Наслаждайтесь Frot!</li>
              </ul>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
