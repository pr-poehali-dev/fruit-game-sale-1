import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const genres = [
  { id: 'strategy', name: 'Стратегия', icon: 'Crown', description: 'Планируй, управляй, побеждай' },
  { id: 'action', name: 'Экшн', icon: 'Zap', description: 'Быстрый геймплей и динамика' },
  { id: 'puzzle', name: 'Головоломка', icon: 'Puzzle', description: 'Логика и смекалка' },
  { id: 'simulator', name: 'Симулятор', icon: 'Gamepad2', description: 'Реалистичный опыт' },
];

const features = [
  { icon: 'Users', title: 'Мультиплеер', text: 'Играй с друзьями онлайн' },
  { icon: 'Trophy', title: 'Достижения', text: '50+ наград за прохождение' },
  { icon: 'Sparkles', title: 'HD графика', text: 'Красивая визуализация' },
  { icon: 'Shield', title: 'Без рекламы', text: 'Чистый игровой опыт' },
];

export default function Index() {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        
        <header className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 px-4 py-2 text-sm" variant="secondary">
            Специальная цена
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
            FROTA
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
            Новая эра игрового опыта
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl md:text-5xl font-bold text-purple-600">20 ₽</span>
            <Button size="lg" className="text-lg px-8 py-6 animate-scale-in shadow-lg hover:shadow-xl transition-all">
              Купить сейчас
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>
          </div>
        </header>

        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Определите жанр игры
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Выберите стиль, который вам ближе всего
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {genres.map((genre, index) => (
              <Card
                key={genre.id}
                className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  selectedGenre === genre.id 
                    ? 'ring-2 ring-purple-600 bg-purple-50' 
                    : 'hover:border-purple-300'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedGenre(genre.id)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`mb-4 p-4 rounded-full transition-colors ${
                    selectedGenre === genre.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    <Icon name={genre.icon as any} size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{genre.name}</h3>
                  <p className="text-sm text-muted-foreground">{genre.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Возможности игры
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Всё, что делает Frota особенной
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-xl hover:bg-purple-50/50 transition-colors"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Icon name={feature.icon as any} size={24} className="text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы начать приключение?
          </h2>
          <p className="text-lg mb-8 text-purple-100">
            Присоединяйтесь к тысячам игроков уже сегодня
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all">
            Купить Frota за 20 ₽
            <Icon name="ShoppingCart" size={20} className="ml-2" />
          </Button>
        </section>

      </div>

      <footer className="border-t mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Frota Game. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
