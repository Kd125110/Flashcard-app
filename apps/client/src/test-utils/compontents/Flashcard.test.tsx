import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Flashcard from '../../components/Flashcard';
import '@testing-library/jest-dom';

describe('Flashcard Component', () => {
  const defaultProps = {
    question: 'What is React?',
    answer: 'A JavaScript library for building user interfaces',
    category: 'Programming',
    sourceLang: 'English',
    targetLang: 'Polish',
  };

  test('renders front side of flashcard by default', () => {
    render(<Flashcard {...defaultProps} />);
    
    // Check that front side content is visible
    expect(screen.getByText(defaultProps.question)).toBeInTheDocument();
    expect(screen.getByText(`Język źródłowy: ${defaultProps.sourceLang}`)).toBeInTheDocument();
    
    // Use getAllByText for category since it appears on both sides
    const categoryElements = screen.getAllByText(defaultProps.category);
    expect(categoryElements[0]).toBeInTheDocument();
    
    // Instead of checking visibility, check if the card container doesn't have the flipped class
    const cardContainer = screen.getByText(defaultProps.question).closest('.relative');
    expect(cardContainer).not.toHaveClass('rotate-y-180');
  });

  test('flips to show answer when clicked', () => {
    render(<Flashcard {...defaultProps} />);
    
    // Click the flashcard to flip it
    fireEvent.click(screen.getByText(defaultProps.question));
    
    // Check that the card container has the flipped class
    const cardContainer = screen.getByText(defaultProps.answer).closest('.relative');
    expect(cardContainer).toHaveClass('rotate-y-180');
    
    // Check that back side content is in the document
    expect(screen.getByText(defaultProps.answer)).toBeInTheDocument();
    expect(screen.getByText(`Język docelowy: ${defaultProps.targetLang}`)).toBeInTheDocument();
  });

  test('flips back to question when clicked again', () => {
    render(<Flashcard {...defaultProps} />);
    
    // First click to flip to answer
    fireEvent.click(screen.getByText(defaultProps.question));
    
    // Second click to flip back to question
    fireEvent.click(screen.getByText(defaultProps.answer));
    
    // Check that the card container doesn't have the flipped class
    const cardContainer = screen.getByText(defaultProps.question).closest('.relative');
    expect(cardContainer).not.toHaveClass('rotate-y-180');
    
    // Check that front side content is in the document
    expect(screen.getByText(defaultProps.question)).toBeInTheDocument();
    expect(screen.getByText(`Język źródłowy: ${defaultProps.sourceLang}`)).toBeInTheDocument();
  });

  test('applies blur effect to answer when blurred prop is true', () => {
    render(<Flashcard {...defaultProps} blurred={true} />);
    
    // Flip the card to see the answer
    fireEvent.click(screen.getByText(defaultProps.question));
    
    // Check that the answer has the blur class
    const answerElement = screen.getByText(defaultProps.answer);
    expect(answerElement.className).toContain('blur-sm');
  });

  test('does not apply blur effect to answer when blurred prop is false', () => {
    render(<Flashcard {...defaultProps} blurred={false} />);
    
    // Flip the card to see the answer
    fireEvent.click(screen.getByText(defaultProps.question));
    
    // Check that the answer does not have the blur class
    const answerElement = screen.getByText(defaultProps.answer);
    expect(answerElement.className).not.toContain('blur-sm');
  });

  test('displays category on both sides of the card', () => {
    render(<Flashcard {...defaultProps} />);
    
    // Check category on front side (using getAllByText since it appears on both sides)
    const categoryElements = screen.getAllByText(defaultProps.category);
    expect(categoryElements.length).toBe(2); // Should be present on both sides
    
    // Flip the card
    fireEvent.click(screen.getByText(defaultProps.question));
    
    // Category should still be in the document after flipping
    expect(screen.getAllByText(defaultProps.category)[1]).toBeInTheDocument();
  });

  test('renders with default blurred value when not provided', () => {
    render(<Flashcard {...defaultProps} />);
    
    // Flip the card to see the answer
    fireEvent.click(screen.getByText(defaultProps.question));
    
    // Check that the answer does not have the blur class by default
    const answerElement = screen.getByText(defaultProps.answer);
    expect(answerElement.className).not.toContain('blur-sm');
  });
});