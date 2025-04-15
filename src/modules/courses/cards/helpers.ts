import { CardEntity } from '@/modules';

export const getCardsForUpdatePosition = (
  cards: CardEntity[],
  newCard: { id: string; position: number },
): CardEntity[] => {
  // Находим индекс перемещаемой карточки
  const currentIndex = cards.findIndex((card) => card.id === newCard.id);

  if (currentIndex === -1) return []; // если карта не найдена - ничего не меняем

  // Удаляем и вставляем карту в новое место
  const [movingCard] = cards.splice(currentIndex, 1);
  cards.splice(newCard.position - 1, 0, movingCard);

  // Обновляем позиции
  const updatedCards = cards.map((card, index) => ({
    ...card,
    position: index + 1,
  }));

  // Возвращаем только те, у которых изменилась позиция
  return updatedCards.filter(
    (card) => cards.find((c) => c.id === card.id)?.position !== card.position,
  );
};
