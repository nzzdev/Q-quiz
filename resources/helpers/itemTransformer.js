const questionTypes = ['multipleChoice', 'numberGuess', 'mapPointGuess'];

function transform(item) {
  // extract only one of the possibly existing cover elements, undefined otherwise
  const coverElement = item.elements.filter(element => {
    return element.type === 'cover';
  })[0];

  const hasCover = coverElement !== undefined;

  // extract only one of the possibly existing last card elements, undefined otherwise
  const lastCardElement = item.elements.filter(element => {
    return element.type === 'lastCard';
  })[0];

  const hasLastCard = lastCardElement !== undefined;
  
  // extract question elements
  const questionElements = item.elements.filter(element => {
    return questionTypes.includes(element.type);
  })

  let numberElements = questionElements.length;
  if (hasCover) {
    numberElements++;
  }

  if (hasLastCard) {
    numberElements++;
  }

  // prepare data for server side rendering
  item.questions = questionElements;
  item.cover = coverElement;
  item.lastCard = lastCardElement;
  item.hasCover = hasCover;
  item.hasLastCard = hasLastCard;
  item.elementCount = numberElements;

  return item;
}

module.exports = transform;
