import { randomFromArray, shuffleArray } from '../utils/rng';

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface TriviaBank {
  sports: TriviaQuestion[];
  science: TriviaQuestion[];
  history: TriviaQuestion[];
  geography: TriviaQuestion[];
  entertainment: TriviaQuestion[];
}

export interface TriviaService {
  loadTriviaBank: () => Promise<void>;
  getRandomQuestion: (category?: string) => TriviaQuestion | null;
  getQuestionsByCategory: (category: string) => TriviaQuestion[];
  getQuestionsByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => TriviaQuestion[];
  validateAnswer: (questionId: string, selectedIndex: number) => boolean;
  getCategories: () => string[];
}

// Sample trivia questions for the app
const defaultTriviaBank: TriviaBank = {
  sports: [
    {
      id: 'sports_1',
      question: 'How long is a marathon race?',
      options: ['26.2 miles', '25.5 miles', '27.1 miles', '24.8 miles'],
      correctIndex: 0,
      category: 'sports',
      difficulty: 'easy',
      explanation: 'A marathon is exactly 26.2 miles or 42.195 kilometers.',
    },
    {
      id: 'sports_2',
      question: 'Which sport is known as "the beautiful game"?',
      options: ['Basketball', 'Soccer', 'Tennis', 'Baseball'],
      correctIndex: 1,
      category: 'sports',
      difficulty: 'easy',
    },
    {
      id: 'sports_3',
      question: 'What is the fastest recorded human running speed?',
      options: ['27.8 mph', '28.2 mph', '27.3 mph', '29.1 mph'],
      correctIndex: 0,
      category: 'sports',
      difficulty: 'medium',
      explanation: 'Usain Bolt reached 27.8 mph during his 100m world record run.',
    },
    {
      id: 'sports_4',
      question: 'Which muscle is known as the "runner\'s muscle"?',
      options: ['Quadriceps', 'Calves', 'Glutes', 'Hamstrings'],
      correctIndex: 2,
      category: 'sports',
      difficulty: 'medium',
    },
    {
      id: 'sports_5',
      question: 'What does VO2 max measure?',
      options: ['Heart rate', 'Oxygen uptake', 'Lung capacity', 'Blood pressure'],
      correctIndex: 1,
      category: 'sports',
      difficulty: 'hard',
    },
  ],
  science: [
    {
      id: 'science_1',
      question: 'What percentage of the human body is water?',
      options: ['50%', '60%', '70%', '80%'],
      correctIndex: 1,
      category: 'science',
      difficulty: 'easy',
    },
    {
      id: 'science_2',
      question: 'How many bones are in the adult human body?',
      options: ['196', '206', '216', '226'],
      correctIndex: 1,
      category: 'science',
      difficulty: 'medium',
    },
    {
      id: 'science_3',
      question: 'What is the chemical symbol for oxygen?',
      options: ['Ox', 'O', 'O2', 'Og'],
      correctIndex: 1,
      category: 'science',
      difficulty: 'easy',
    },
    {
      id: 'science_4',
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Earth', 'Mercury', 'Mars'],
      correctIndex: 2,
      category: 'science',
      difficulty: 'easy',
    },
    {
      id: 'science_5',
      question: 'What is the speed of light in a vacuum?',
      options: ['299,792,458 m/s', '300,000,000 m/s', '299,000,000 m/s', '301,000,000 m/s'],
      correctIndex: 0,
      category: 'science',
      difficulty: 'hard',
    },
  ],
  history: [
    {
      id: 'history_1',
      question: 'In which year did World War II end?',
      options: ['1944', '1945', '1946', '1947'],
      correctIndex: 1,
      category: 'history',
      difficulty: 'easy',
    },
    {
      id: 'history_2',
      question: 'Who was the first person to run a mile in under 4 minutes?',
      options: ['Roger Bannister', 'Jesse Owens', 'Emil Zátopek', 'Paavo Nurmi'],
      correctIndex: 0,
      category: 'history',
      difficulty: 'medium',
    },
    {
      id: 'history_3',
      question: 'Which ancient civilization built Machu Picchu?',
      options: ['Aztec', 'Maya', 'Inca', 'Olmec'],
      correctIndex: 2,
      category: 'history',
      difficulty: 'medium',
    },
    {
      id: 'history_4',
      question: 'When were the first modern Olympic Games held?',
      options: ['1892', '1896', '1900', '1904'],
      correctIndex: 1,
      category: 'history',
      difficulty: 'medium',
    },
    {
      id: 'history_5',
      question: 'Who wrote "The Art of War"?',
      options: ['Confucius', 'Lao Tzu', 'Sun Tzu', 'Mencius'],
      correctIndex: 2,
      category: 'history',
      difficulty: 'hard',
    },
  ],
  geography: [
    {
      id: 'geography_1',
      question: 'What is the capital of Australia?',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
      correctIndex: 2,
      category: 'geography',
      difficulty: 'medium',
    },
    {
      id: 'geography_2',
      question: 'Which is the longest river in the world?',
      options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'],
      correctIndex: 1,
      category: 'geography',
      difficulty: 'easy',
    },
    {
      id: 'geography_3',
      question: 'How many continents are there?',
      options: ['5', '6', '7', '8'],
      correctIndex: 2,
      category: 'geography',
      difficulty: 'easy',
    },
    {
      id: 'geography_4',
      question: 'Which country has the most time zones?',
      options: ['Russia', 'United States', 'China', 'France'],
      correctIndex: 3,
      category: 'geography',
      difficulty: 'hard',
      explanation: 'France has 12 time zones due to its overseas territories.',
    },
    {
      id: 'geography_5',
      question: 'What is the highest mountain in Africa?',
      options: ['Mount Kenya', 'Mount Kilimanjaro', 'Mount Elgon', 'Ras Dashan'],
      correctIndex: 1,
      category: 'geography',
      difficulty: 'medium',
    },
  ],
  entertainment: [
    {
      id: 'entertainment_1',
      question: 'Which movie won the Academy Award for Best Picture in 2020?',
      options: ['1917', 'Joker', 'Parasite', 'Once Upon a Time in Hollywood'],
      correctIndex: 2,
      category: 'entertainment',
      difficulty: 'medium',
    },
    {
      id: 'entertainment_2',
      question: 'Who composed "The Four Seasons"?',
      options: ['Bach', 'Mozart', 'Vivaldi', 'Beethoven'],
      correctIndex: 2,
      category: 'entertainment',
      difficulty: 'medium',
    },
    {
      id: 'entertainment_3',
      question: 'Which Netflix series features a chess prodigy?',
      options: ['Stranger Things', 'The Crown', 'The Queen\'s Gambit', 'Bridgerton'],
      correctIndex: 2,
      category: 'entertainment',
      difficulty: 'easy',
    },
    {
      id: 'entertainment_4',
      question: 'Who painted "The Starry Night"?',
      options: ['Pablo Picasso', 'Vincent van Gogh', 'Claude Monet', 'Leonardo da Vinci'],
      correctIndex: 1,
      category: 'entertainment',
      difficulty: 'easy',
    },
    {
      id: 'entertainment_5',
      question: 'Which band released the album "Dark Side of the Moon"?',
      options: ['Led Zeppelin', 'The Beatles', 'Pink Floyd', 'Queen'],
      correctIndex: 2,
      category: 'entertainment',
      difficulty: 'medium',
    },
  ],
};

class TriviaServiceImpl implements TriviaService {
  private triviaBank: TriviaBank = defaultTriviaBank;
  private usedQuestions: Set<string> = new Set();
  private allQuestions: TriviaQuestion[] = [];
  
  async loadTriviaBank(): Promise<void> {
    try {
      // In a real app, you might load from a remote API or local file
      // For now, we'll use the default bank and flatten all questions
      this.allQuestions = [
        ...this.triviaBank.sports,
        ...this.triviaBank.science,
        ...this.triviaBank.history,
        ...this.triviaBank.geography,
        ...this.triviaBank.entertainment,
      ];
      
      console.log(`Loaded ${this.allQuestions.length} trivia questions`);
    } catch (error) {
      console.error('Error loading trivia bank:', error);
    }
  }
  
  getRandomQuestion(category?: string): TriviaQuestion | null {
    try {
      let availableQuestions: TriviaQuestion[];
      
      if (category) {
        availableQuestions = this.getQuestionsByCategory(category);
      } else {
        availableQuestions = this.allQuestions;
      }
      
      // Filter out used questions
      const unusedQuestions = availableQuestions.filter(
        q => !this.usedQuestions.has(q.id)
      );
      
      // If all questions have been used, reset the used set
      if (unusedQuestions.length === 0) {
        this.usedQuestions.clear();
        if (category) {
          return randomFromArray(this.getQuestionsByCategory(category)) || null;
        } else {
          return randomFromArray(this.allQuestions) || null;
        }
      }
      
      const question = randomFromArray(unusedQuestions);
      if (question) {
        this.usedQuestions.add(question.id);
        
        // Shuffle the options to prevent memorization
        const shuffledQuestion = this.shuffleQuestionOptions(question);
        return shuffledQuestion;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting random question:', error);
      return null;
    }
  }
  
  getQuestionsByCategory(category: string): TriviaQuestion[] {
    const normalizedCategory = category.toLowerCase();
    return this.triviaBank[normalizedCategory as keyof TriviaBank] || [];
  }
  
  getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TriviaQuestion[] {
    return this.allQuestions.filter(q => q.difficulty === difficulty);
  }
  
  validateAnswer(questionId: string, selectedIndex: number): boolean {
    const question = this.allQuestions.find(q => q.id === questionId);
    return question ? question.correctIndex === selectedIndex : false;
  }
  
  getCategories(): string[] {
    return Object.keys(this.triviaBank);
  }
  
  private shuffleQuestionOptions(question: TriviaQuestion): TriviaQuestion {
    // Create a copy of the question with shuffled options
    const originalOptions = [...question.options];
    const originalCorrectIndex = question.correctIndex;
    const originalCorrectAnswer = originalOptions[originalCorrectIndex];
    
    // Create an array of options with their original indices
    const optionsWithIndices = originalOptions.map((option, index) => ({
      option,
      originalIndex: index,
    }));
    
    // Shuffle the options
    const shuffledOptionsWithIndices = shuffleArray(optionsWithIndices);
    
    // Find the new index of the correct answer
    const newCorrectIndex = shuffledOptionsWithIndices.findIndex(
      item => item.originalIndex === originalCorrectIndex
    );
    
    return {
      ...question,
      options: shuffledOptionsWithIndices.map(item => item.option),
      correctIndex: newCorrectIndex,
    };
  }
  
  // Method to add custom questions (for future expansion)
  addCustomQuestion(question: TriviaQuestion): void {
    const category = question.category.toLowerCase() as keyof TriviaBank;
    if (this.triviaBank[category]) {
      this.triviaBank[category].push(question);
      this.allQuestions.push(question);
    }
  }
  
  // Method to get statistics
  getStatistics(): {
    totalQuestions: number;
    questionsByCategory: Record<string, number>;
    questionsByDifficulty: Record<string, number>;
    usedQuestions: number;
  } {
    const questionsByCategory = Object.keys(this.triviaBank).reduce((acc, category) => {
      acc[category] = this.getQuestionsByCategory(category).length;
      return acc;
    }, {} as Record<string, number>);
    
    const questionsByDifficulty = ['easy', 'medium', 'hard'].reduce((acc, difficulty) => {
      acc[difficulty] = this.getQuestionsByDifficulty(difficulty as any).length;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalQuestions: this.allQuestions.length,
      questionsByCategory,
      questionsByDifficulty,
      usedQuestions: this.usedQuestions.size,
    };
  }
  
  // Reset used questions (useful for long runs)
  resetUsedQuestions(): void {
    this.usedQuestions.clear();
  }
}

// Singleton instance
export const triviaService = new TriviaServiceImpl();

// Helper functions
export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return '#4CAF50';
    case 'medium':
      return '#FF9800';
    case 'hard':
      return '#F44336';
    default:
      return '#757575';
  }
}

export function getCategoryEmoji(category: string): string {
  switch (category.toLowerCase()) {
    case 'sports':
      return '⚽';
    case 'science':
      return '🔬';
    case 'history':
      return '📚';
    case 'geography':
      return '🌍';
    case 'entertainment':
      return '🎬';
    default:
      return '❓';
  }
}

export function formatCategoryName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// Initialize the trivia service
triviaService.loadTriviaBank();