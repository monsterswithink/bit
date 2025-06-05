interface ClickbaitTerms {
  high_risk: string[]
  medium_risk: string[]
  low_risk: string[]
}

const clickbaitTerms: ClickbaitTerms = {
  high_risk: [
    "YOU WON'T BELIEVE",
    "SHOCKING",
    "DOCTORS HATE",
    "ONE WEIRD TRICK",
    "GONE WRONG",
    "GONE SEXUAL",
    "CLICKBAIT",
    "MUST WATCH",
    "INSANE",
    "CRAZY",
    "UNBELIEVABLE",
  ],
  medium_risk: [
    "AMAZING",
    "INCREDIBLE",
    "MIND-BLOWING",
    "EPIC",
    "ULTIMATE",
    "SECRET",
    "REVEALED",
    "EXPOSED",
    "TRUTH",
    "HIDDEN",
  ],
  low_risk: ["BEST", "TOP", "WORST", "FIRST TIME", "REACTION", "REVIEW", "TUTORIAL", "HOW TO"],
}

export async function analyzeImageForClickbait(imageUrl: string): Promise<{
  clickbaitScore: number
  detectedTerms: string[]
  ocrText: string
}> {
  try {
    // For demo purposes, return a mock analysis to prevent API errors
    const mockTerms = ["AMAZING", "BEST"]
    const mockText = "Sample detected text from image"

    return {
      clickbaitScore: Math.floor(Math.random() * 5) + 1, // 1-5 score
      detectedTerms: mockTerms,
      ocrText: mockText,
    }
  } catch (error) {
    console.error("Error analyzing image:", error)
    return {
      clickbaitScore: 0,
      detectedTerms: [],
      ocrText: "",
    }
  }
}

export function calculateQualityScore(
  views: number,
  likes: number,
  dislikes: number,
  mutedCount: number,
  previewExists: boolean,
  clickbaitScore: number,
  relevanceScore: number,
): number {
  const engagementRatio = likes / Math.max(views, 1)
  const dislikeRatio = dislikes / Math.max(views, 1)
  const muteRatio = mutedCount / Math.max(views, 1)

  let score = 0

  // Base engagement score (0-40 points)
  score += Math.min(engagementRatio * 100, 40)

  // Penalize dislikes (0 to -20 points)
  score -= Math.min(dislikeRatio * 100, 20)

  // Penalize muted channels (0 to -30 points)
  score -= Math.min(muteRatio * 150, 30)

  // Bonus for preview content (0-15 points)
  if (previewExists) {
    score += 15
  }

  // Relevance score (0-25 points)
  score += Math.min(relevanceScore, 25)

  // Penalize clickbait (0 to -20 points)
  score -= Math.min(clickbaitScore * 2, 20)

  // Normalize to 0-100 scale
  return Math.max(0, Math.min(100, score))
}
