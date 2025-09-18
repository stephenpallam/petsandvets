import os
import base64
import asyncio
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Import cost tracking functions (will be available when server imports this)
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from server import log_ai_usage, calculate_text_cost, calculate_image_cost, CostType

# Load environment variables
load_dotenv()

# Import Emergent integrations
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

# Set up logging
logger = logging.getLogger(__name__)

class AIContentGenerator:
    """AI service for generating social media content and images"""
    
    def __init__(self):
        self.emergent_key = os.getenv('EMERGENT_LLM_KEY')
        self.openai_key = os.getenv('OPENAI_API_KEY')  # For image generation
        
        # Use Emergent key as fallback for OpenAI if available
        if not self.openai_key and self.emergent_key:
            self.openai_key = self.emergent_key
    
    async def format_custom_content(
        self,
        post_title: str,
        post_content: str,
        word_count: str,
        platforms: List[str],
        use_web_research: bool = False,
        image_text: Optional[str] = None
    ) -> Dict[str, Any]:
        """Format custom written content for specific social media platforms"""
        
        try:
            # Generate title if not provided
            generated_title = post_title
            if not post_title or post_title.strip() == "":
                generated_title = await self._generate_title_from_content(post_content)
                logger.info(f"Generated title from content: {generated_title}")
            
            # Get platform-specific characteristics
            platform = platforms[0] if platforms else "general"
            platform_info = self._get_platform_characteristics(platform)
            
            # Create system message for content formatting with platform specifics
            system_message = f"""You are an expert social media content formatter for veterinary practices, specialized in {platform_info['name']}.
            Your job is to take user-written content and format it appropriately for {platform_info['name']}
            while maintaining the original message and professional veterinary tone.
            
            Platform-specific formatting for {platform_info['name']}:
            - {platform_info['tone']}
            - {platform_info['format']}
            - {platform_info['hashtag_style']}
            - {platform_info['length_guide']}
            
            You can enhance the content with relevant information if requested to do web research."""
            
            # Create user prompt for formatting
            research_instruction = f"""
            Please also enhance this content with current, relevant veterinary information and trends appropriate for {platform_info['name']} if helpful.
            """ if use_web_research else ""
            
            user_prompt = f"""Format this veterinary content for {platform_info['name']}:

Title: {generated_title}
Content: {post_content}

Requirements:
- Platform: {platform_info['name']} - {platform_info['description']}
- Word count: {word_count} words maximum
- {platform_info['hashtag_instruction']}
- Use {platform_info['tone']}
- {platform_info['length_guide']}
{platform_info['special_requirements']}
{research_instruction}

Please format the response as:
Title: [optimized title for {platform_info['name']}, {platform_info['title_length']}]
Content: [formatted content optimized for {platform_info['name']}]
Hashtags: [comma-separated hashtags without # symbol, {platform_info['hashtag_count']}]
"""

            # Initialize LLM chat
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"format_content_{datetime.now().timestamp()}",
                system_message=system_message
            ).with_model("openai", "gpt-4o-mini")
            
            # Send message and get response
            user_message = UserMessage(text=user_prompt)
            response = await chat.send_message(user_message)
            
            # Parse response with title
            generated_title_from_response, content, hashtags = self._parse_content_with_title_response(response)
            
            # Use the optimized title from response if available, otherwise use the generated title
            final_title = generated_title_from_response if generated_title_from_response else generated_title
            
            return {
                "content": content,
                "hashtags": hashtags,
                "topic": final_title,
                "platforms": platforms,
                "word_count": len(content.split()) if content else 0,
                "original_title": post_title,
                "generated_title": final_title,
                "original_content": post_content,
                "enhanced_with_research": use_web_research
            }
            
        except Exception as e:
            logger.error(f"Error formatting custom content: {str(e)}")
            raise Exception(f"Failed to format content: {str(e)}")

    def _get_platform_characteristics(self, platform: str) -> Dict[str, str]:
        """Get platform-specific characteristics for content generation"""
        platform_map = {
            'facebook': {
                'name': 'Facebook',
                'description': 'longer form content with personal engagement',
                'tone': 'conversational and community-focused tone',
                'format': 'longer paragraphs with story-telling elements',
                'hashtag_style': 'moderate use of hashtags (3-5)',
                'hashtag_instruction': 'Include 3-5 strategic hashtags',
                'hashtag_count': '3-5 hashtags',
                'length_guide': 'can be up to 400+ characters',
                'title_length': '5-10 words max',
                'special_requirements': '- Encourage engagement with questions\n- Use emojis sparingly\n- Include call-to-action for comments'
            },
            'instagram': {
                'name': 'Instagram',
                'description': 'visual-first platform with hashtag optimization',
                'tone': 'trendy and visually appealing tone',
                'format': 'shorter captions with strong visual appeal',
                'hashtag_style': 'heavy hashtag use (8-15 hashtags)',
                'hashtag_instruction': 'Include 8-15 relevant hashtags for maximum reach',
                'hashtag_count': '8-15 hashtags',
                'length_guide': 'keep captions under 300 characters for better engagement',
                'title_length': '3-6 words max',
                'special_requirements': '- Optimize for visual storytelling\n- Use trending hashtags when relevant\n- Include location-based hashtags if applicable'
            },
            'twitter': {
                'name': 'Twitter/X',
                'description': 'concise, timely content with trending elements',
                'tone': 'concise and direct tone',
                'format': 'very short, punchy content',
                'hashtag_style': 'minimal hashtag use (1-3)',
                'hashtag_instruction': 'Include 1-3 highly relevant hashtags',
                'hashtag_count': '1-3 hashtags',
                'length_guide': 'must be under 280 characters total',
                'title_length': '2-4 words max',
                'special_requirements': '- Keep it under 280 characters\n- Use trending topics when relevant\n- Include @mentions if applicable'
            },
            'whatsapp': {
                'name': 'WhatsApp',
                'description': 'personal, direct communication style',
                'tone': 'personal and conversational tone',
                'format': 'message-like format with personal touch',
                'hashtag_style': 'minimal or no hashtags',
                'hashtag_instruction': 'Use 1-3 hashtags only if highly relevant',
                'hashtag_count': '0-3 hashtags',
                'length_guide': 'keep messages conversational and not too long',
                'title_length': '3-5 words max',
                'special_requirements': '- Write like a personal message\n- Include practical tips\n- Use friendly, approachable language'
            }
        }
        
        return platform_map.get(platform.lower(), {
            'name': 'Social Media',
            'description': 'general social media platform',
            'tone': 'professional and engaging tone',
            'format': 'standard social media format',
            'hashtag_style': 'moderate hashtag use',
            'hashtag_instruction': 'Include 3-5 relevant hashtags',
            'hashtag_count': '3-5 hashtags',
            'length_guide': 'moderate length content',
            'title_length': '5-8 words max',
            'special_requirements': '- Keep content engaging and informative'
        })

    async def generate_social_media_content(
        self,
        topic: str,
        word_count: str,
        platforms: List[str],
        custom_topic: Optional[str] = None,
        image_text: Optional[str] = None,
        track_usage: bool = True,
        user_id: str = None,
        agent_id: str = None
    ) -> Dict[str, Any]:
        """Generate platform-specific social media content for veterinary posts"""
        
        try:
            # Determine the actual topic
            actual_topic = custom_topic if topic == "Custom" and custom_topic else topic
            
            # Get platform-specific characteristics
            platform = platforms[0] if platforms else "general"
            platform_info = self._get_platform_characteristics(platform)
            
            # Create system message for veterinary content with platform specifics
            system_message = f"""You are an expert veterinary social media content creator specialized in creating content for {platform_info['name']}. 
            Create engaging, informative, and professional posts about veterinary topics that would be suitable for pet owners.
            Always maintain a caring, professional tone while being informative and engaging.
            
            Platform-specific requirements for {platform_info['name']}:
            - {platform_info['tone']}
            - {platform_info['format']}
            - {platform_info['hashtag_style']}
            - {platform_info['length_guide']}
            
            Focus on pet health, wellness, and care advice."""
            
            # Create user prompt based on topic and platform characteristics
            user_prompt = f"""Create a {platform_info['name']} post about: {actual_topic}

Requirements:
- Word count: {word_count} words maximum
- Platform: {platform_info['name']} - {platform_info['description']}
- Make it engaging and informative for pet owners
- {platform_info['hashtag_instruction']}
- Professional veterinary tone with {platform_info['tone']}
- Focus on practical advice or interesting facts
{platform_info['special_requirements']}

Please format the response as:
Title: [catchy title optimized for {platform_info['name']}, {platform_info['title_length']}]
Content: [the main post content optimized for {platform_info['name']}]
Hashtags: [comma-separated hashtags without # symbol, {platform_info['hashtag_count']}]
"""

            # Initialize LLM chat
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"social_media_{datetime.now().timestamp()}",
                system_message=system_message
            ).with_model("openai", "gpt-4o-mini")  # Using cost-effective model
            
            # Send message and get response
            user_message = UserMessage(text=user_prompt)
            response = await chat.send_message(user_message)
            
            # Parse response with title
            generated_title, content, hashtags = self._parse_content_with_title_response(response)
            
            # Extract token usage information for cost tracking
            usage_info = {}
            if hasattr(response, 'usage') and response.usage:
                usage_info = {
                    "prompt_tokens": getattr(response.usage, 'prompt_tokens', 0),
                    "completion_tokens": getattr(response.usage, 'completion_tokens', 0),
                    "total_tokens": getattr(response.usage, 'total_tokens', 0)
                }
            
            result = {
                "content": content,
                "hashtags": hashtags,
                "topic": actual_topic,
                "generated_title": generated_title,
                "platforms": platforms,
                "word_count": len(content.split()) if content else 0,
                "usage_info": usage_info
            }
            
            # Add tracking metadata if enabled
            if track_usage:
                result["track_usage"] = {
                    "user_id": user_id,
                    "agent_id": agent_id,
                    "provider": "openai",
                    "model": "gpt-4o-mini"
                }
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            raise Exception(f"Failed to generate content: {str(e)}")
    
    async def generate_image(
        self,
        content: str,
        topic: str,
        image_text: Optional[str] = None,
        size: str = "1024x1024",
        quality: str = "standard",
        track_usage: bool = True,
        user_id: str = None,
        agent_id: str = None
    ) -> Dict[str, Any]:
        """Generate an image based on the content and topic"""
        
        try:
            if not self.openai_key:
                logger.warning("No OpenAI key available for image generation")
                return None
            
            # Create image prompt based on content and topic
            image_prompt = self._create_image_prompt(content, topic, image_text)
            
            # Initialize image generator
            image_gen = OpenAIImageGeneration(api_key=self.openai_key)
            
            # Generate image
            images = await image_gen.generate_images(
                prompt=image_prompt,
                model="gpt-image-1",  # Using latest model
                number_of_images=1
            )
            
            if images and len(images) > 0:
                # Save image to upload folder instead of storing as base64
                upload_dir = Path("/app/data/upload/photos/ai-generated")
                upload_dir.mkdir(parents=True, exist_ok=True)
                
                # Generate unique filename
                image_id = str(uuid.uuid4())
                filename = f"ai_post_{image_id}.png"
                file_path = upload_dir / filename
                
                # Save the image bytes to file
                with open(file_path, 'wb') as f:
                    f.write(images[0])
                
                # Return the URL path that can be served by the API
                image_url = f"/api/files/ai-generated/{filename}"
                logger.info(f"Image saved to: {file_path}, URL: {image_url}")
                
                result = {
                    "image_url": image_url,
                    "images_generated": 1,
                    "size": size,
                    "quality": quality
                }
                
                # Add tracking metadata if enabled
                if track_usage:
                    result["track_usage"] = {
                        "user_id": user_id,
                        "agent_id": agent_id,
                        "provider": "openai",
                        "model": "dall-e-3"
                    }
                
                return result
            else:
                logger.warning("No image was generated")
                return None
                
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return None
    
    def _parse_content_response(self, response: str) -> tuple[str, List[str]]:
        """Parse the LLM response to extract content and hashtags"""
        
        try:
            lines = response.strip().split('\n')
            content = ""
            hashtags = []
            
            current_section = None
            
            for line in lines:
                line = line.strip()
                if line.lower().startswith('content:'):
                    current_section = 'content'
                    content = line[8:].strip()  # Remove "Content:" prefix
                elif line.lower().startswith('hashtags:'):
                    current_section = 'hashtags'
                    hashtag_text = line[9:].strip()  # Remove "Hashtags:" prefix
                    # Split by comma and clean up
                    hashtags = [tag.strip().replace('#', '') for tag in hashtag_text.split(',') if tag.strip()]
                elif current_section == 'content' and line:
                    content += " " + line
                elif current_section == 'hashtags' and line:
                    # Handle multi-line hashtags
                    more_tags = [tag.strip().replace('#', '') for tag in line.split(',') if tag.strip()]
                    hashtags.extend(more_tags)
            
            # Fallback if parsing fails
            if not content and not hashtags:
                # Try to extract hashtags from the end of the response
                words = response.split()
                hashtags = [word[1:] for word in words if word.startswith('#')]
                # Remove hashtags from content
                content = response
                for hashtag in hashtags:
                    content = content.replace(f'#{hashtag}', '').strip()
            
            return content.strip(), hashtags
            
        except Exception as e:
            logger.error(f"Error parsing content response: {str(e)}")
            # Return the raw response as content if parsing fails
            return response.strip(), []
    
    def _parse_content_with_title_response(self, response: str) -> tuple[str, str, List[str]]:
        """Parse the LLM response to extract title, content and hashtags"""
        
        try:
            lines = response.strip().split('\n')
            title = ""
            content = ""
            hashtags = []
            
            current_section = None
            
            for line in lines:
                line = line.strip()
                if line.lower().startswith('title:'):
                    current_section = 'title'
                    title = line[6:].strip()  # Remove "Title:" prefix
                elif line.lower().startswith('content:'):
                    current_section = 'content'
                    content = line[8:].strip()  # Remove "Content:" prefix
                elif line.lower().startswith('hashtags:'):
                    current_section = 'hashtags'
                    hashtag_text = line[9:].strip()  # Remove "Hashtags:" prefix
                    # Split by comma and clean up
                    hashtags = [tag.strip().replace('#', '') for tag in hashtag_text.split(',') if tag.strip()]
                elif current_section == 'title' and line:
                    title += " " + line
                elif current_section == 'content' and line:
                    content += " " + line
                elif current_section == 'hashtags' and line:
                    # Handle multi-line hashtags
                    more_tags = [tag.strip().replace('#', '') for tag in line.split(',') if tag.strip()]
                    hashtags.extend(more_tags)
            
            # Clean up title (remove quotes if present)
            title = title.strip().strip('"').strip("'").strip()
            
            # Fallback if parsing fails
            if not content and not hashtags and not title:
                # Try to extract hashtags from the end of the response
                words = response.split()
                hashtags = [word[1:] for word in words if word.startswith('#')]
                # Use original response as content
                content = response
                for hashtag in hashtags:
                    content = content.replace(f'#{hashtag}', '').strip()
                title = "Pet Care Tips"  # Default title
            
            return title.strip(), content.strip(), hashtags
            
        except Exception as e:
            logger.error(f"Error parsing content with title response: {str(e)}")
            # Return fallback values if parsing fails
            return "Pet Care Tips", response.strip(), []
    
    def _create_image_prompt(self, content: str, topic: str, image_text: Optional[str] = None) -> str:
        """Create an appropriate image prompt for veterinary content"""
        
        # Base veterinary visual elements
        base_prompt = "Professional veterinary"
        
        # Add topic-specific visual elements
        if "dental" in topic.lower() or "teeth" in content.lower():
            base_prompt += " dental care, clean teeth, healthy pet mouth"
        elif "nutrition" in topic.lower() or "food" in topic.lower():
            base_prompt += " pet nutrition, healthy pet food, feeding"
        elif "vaccination" in topic.lower() or "vaccine" in topic.lower():
            base_prompt += " vaccination, syringe, preventive care"
        elif "emergency" in topic.lower() or "urgent" in topic.lower():
            base_prompt += " emergency care, medical attention"
        elif "wellness" in topic.lower() or "checkup" in topic.lower():
            base_prompt += " wellness exam, healthy pet, stethoscope"
        else:
            base_prompt += " pet healthcare, veterinary clinic"
        
        # Add general elements
        base_prompt += ", cute dog or cat, clean modern veterinary clinic background"
        base_prompt += ", professional lighting, high quality, friendly atmosphere"
        
        # Add style specifications
        base_prompt += ", stock photo style, social media friendly, warm colors"
        
        # Note: Text overlay will be handled by frontend, not burned into image
        # The image_text parameter is available for context but not included in image generation
        
        return base_prompt
    
    async def get_trending_topics(self, category: str = "veterinary") -> List[str]:
        """Get trending topics for content generation (placeholder for now)"""
        
        # Mock trending topics for now - in production this would fetch from news APIs
        veterinary_topics = [
            "Pet Dental Health Awareness",
            "Winter Pet Safety Tips",
            "New Vaccination Guidelines",
            "Pet Nutrition Trends 2025",
            "Emergency Pet Care Signs",
            "Senior Pet Care Essentials",
            "Puppy Training Basics",
            "Cat Behavioral Health",
            "Pet Allergies Management",
            "Preventive Care Importance"
        ]
        
        return veterinary_topics[:5]  # Return top 5
    
    async def _generate_title_from_content(self, post_content: str) -> str:
        """Generate an engaging title from post content when title is not provided"""
        
        try:
            system_message = """You are an expert social media title creator for veterinary practices.
            Generate engaging, clickable titles that capture the essence of the content while being professional and appealing to pet owners."""
            
            user_prompt = f"""Based on this veterinary social media content, create a short, engaging title (5-8 words max):

Content: {post_content[:500]}  # Limit content length for API efficiency

Requirements:
- Keep it short and catchy (5-8 words)
- Make it engaging for pet owners
- Maintain professional veterinary tone
- Focus on the main topic or benefit
- No quotation marks in the response

Title:"""

            # Initialize LLM chat
            chat = LlmChat(
                api_key=self.emergent_key,
                model="gpt-4o",
                temperature=0.7
            )
            
            # Send message and get response
            user_message = UserMessage(text=user_prompt)
            response = await chat.send_message(user_message)
            
            # Clean up the response (remove quotes, extra spaces, etc.)
            generated_title = response.strip().strip('"').strip("'").strip()
            
            # Fallback if generation fails
            if not generated_title or len(generated_title) < 3:
                return "Pet Care Tips"
            
            return generated_title
            
        except Exception as e:
            logger.error(f"Error generating title from content: {str(e)}")
            return "Pet Care Tips"  # Fallback title
    
    async def test_connection(self) -> Dict[str, bool]:
        """Test connections to AI services"""
        
        results = {
            "llm": False,
            "image": False
        }
        
        try:
            # Test LLM connection
            if self.emergent_key:
                chat = LlmChat(
                    api_key=self.emergent_key,
                    session_id="test_connection",
                    system_message="You are a test assistant."
                ).with_model("openai", "gpt-4o-mini")
                
                test_message = UserMessage(text="Say 'Connection successful' and nothing else.")
                response = await chat.send_message(test_message)
                
                if "successful" in response.lower():
                    results["llm"] = True
                    
        except Exception as e:
            logger.error(f"LLM connection test failed: {str(e)}")
        
        try:
            # Test image generation connection
            if self.openai_key:
                image_gen = OpenAIImageGeneration(api_key=self.openai_key)
                # We'll just check if the class initializes properly for now
                results["image"] = True
                
        except Exception as e:
            logger.error(f"Image generation connection test failed: {str(e)}")
        
        return results

    async def regenerate_content(self, current_content: str, topic: str) -> str:
        """Regenerate content using LLM with the current content as context"""
        try:
            if not self.emergent_key:
                logger.error("No Emergent key available for content regeneration")
                return None

            # Create system message for content regeneration
            system_message = """You are an expert social media content creator for veterinary practices.
Your job is to take existing social media content and create a fresh, engaging new version while:
1. Maintaining the core message and veterinary focus
2. Using different wording and structure
3. Keeping the same professional, caring tone
4. Making it engaging for pet owners
5. Staying within similar length to the original
6. Adding relevant details or insights if appropriate

Please provide only the regenerated content without any explanations or additional text."""

            # Create user prompt
            user_prompt = f"""Please create a fresh, new version of this veterinary social media content about "{topic}":

Original Content:
{current_content}

Requirements:
- Keep the same core message and purpose
- Use different words and sentence structure
- Maintain professional veterinary tone
- Make it engaging for pet owners
- Include relevant hashtags if the original had them
- Similar length to the original

Please provide only the regenerated content without any explanations or additional text."""

            # Initialize LLM chat with proper pattern
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"regenerate_content_{uuid.uuid4()}",
                system_message=system_message
            ).with_model("openai", "gpt-4o-mini")

            # Generate new content
            try:
                user_message = UserMessage(text=user_prompt)
                response = await chat.send_message(user_message)
                
                if response and response.strip():
                    new_content = response.strip()
                    logger.info(f"Successfully regenerated content for topic: {topic}")
                    return new_content
                else:
                    logger.error("Empty response from LLM for content regeneration")
                    return None
                    
            except Exception as e:
                logger.error(f"LLM chat failed for content regeneration: {str(e)}")
                return None

        except Exception as e:
            logger.error(f"Error in regenerate_content: {str(e)}")
            return None

    async def format_topic_email_content(
        self,
        template: str,
        customer_name: str,
        pet_names: str,
        topic: str
    ) -> str:
        """Format topic-based email content using ChatGPT for professional, relevant output"""
        
        try:
            if not self.emergent_key:
                logger.error("No Emergent LLM key available for email formatting")
                return template
            
            # Create a comprehensive prompt for topic-based email formatting
            email_prompt = f"""You are a professional email writer for a veterinary clinic. Create a warm, informative, and professionally formatted email based on the topic and template provided.

INSTRUCTIONS:
1. Create email content focused on the specified topic: "{topic}"
2. Use the provided template as a foundation but enhance it significantly
3. Make the content relevant to the topic - include useful information, tips, or updates related to "{topic}"
4. Personalize it for the customer and their pet(s)
5. Fix any grammatical errors and duplicate content
6. Ensure the email flows naturally with proper structure
7. Remove any redundant or duplicate sections (especially greetings and closings)
8. Make the tone warm but professional
9. Include practical, valuable information related to the topic
10. DO NOT include any subject line or "Subject:" in your response - the email subject is handled separately

EMAIL TEMPLATE (use as foundation, but enhance):
{template}

PERSONALIZATION:
- Customer: {customer_name}
- Pet(s): {pet_names}
- Topic Focus: {topic}

IMPORTANT: The email subject is already set separately. DO NOT include any subject line in your response. Start your email directly with the greeting.

Please create a complete, valuable email about "{topic}" that:
- Starts with a warm, personal greeting (only once)
- Provides useful information about the topic
- Makes it relevant to {pet_names}'s care
- Includes practical tips or insights
- Ends with a single, professional closing
- Contains NO duplicate greetings, signatures, or redundant content
- Contains NO subject line or "Subject:" text

The email should be informative and valuable to pet owners, not just generic promotional content."""

            # Call ChatGPT using Emergent integrations
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"topic_email_format_{uuid.uuid4()}",
                system_message="You are a professional email writer for a veterinary clinic specializing in informative, topic-based communications."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(text=email_prompt)
            response = await chat.send_message(user_message)
            
            formatted_content = response.strip()
            
            if formatted_content and formatted_content.strip():
                logger.info(f"Successfully formatted topic-based email using ChatGPT for topic: {topic}")
                return formatted_content.strip()
            else:
                logger.warning("ChatGPT returned empty response for topic email formatting")
                return template
                
        except Exception as e:
            logger.error(f"Error in format_topic_email_content: {str(e)}")
            return template

    async def format_email_content(
        self,
        template: str,
        customer_name: str,
        pet_names: str,
        holiday_name: str,
        holiday_date: str
    ) -> str:
        """Format email content using ChatGPT for professional, grammatically correct output"""
        
        try:
            if not self.emergent_key:
                logger.error("No Emergent LLM key available for email formatting")
                return template
            
            # Create a comprehensive prompt for email formatting
            email_prompt = f"""You are a professional email formatter for a veterinary clinic. Please take the following email template and create a warm, grammatically perfect, and professionally formatted email.

INSTRUCTIONS:
1. Fix any grammatical errors
2. Make the tone warm but professional
3. Ensure the email flows naturally
4. Remove any duplicate or redundant closing statements
5. Create ONE cohesive, well-structured email
6. Keep the core message but enhance the language
7. Make it specific to the holiday and personal to the customer and their pets
8. DO NOT include any subject line or "Subject:" in your response - the email subject is handled separately

EMAIL TEMPLATE:
{template}

DETAILS:
- Customer: {customer_name}
- Pet(s): {pet_names}
- Holiday: {holiday_name}
- Date: {holiday_date}

IMPORTANT: The email subject is already set separately. DO NOT include any subject line in your response. Start your email directly with the greeting.

Please create a complete, polished email that a veterinary clinic would be proud to send. Include:
- A warm greeting
- The main message (enhanced from the template)
- Holiday-specific well wishes
- A single, professional closing

Make sure there are no duplicate signatures, redundant messages, or subject lines."""

            # Call ChatGPT using Emergent integrations
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"email_format_{uuid.uuid4()}",
                system_message="You are a professional email formatter for a veterinary clinic."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(text=email_prompt)
            response = await chat.send_message(user_message)
            
            formatted_email = response.strip()
            
            # Log the API usage (will be imported from server)
            try:
                from server import log_ai_usage, calculate_text_cost, CostType
                cost = calculate_text_cost(len(email_prompt) + len(formatted_email), "gpt-4o-mini")
                await log_ai_usage(
                    agent_id=None,
                    cost_type=CostType.EMAIL_FORMATTING,
                    cost=cost,
                    model="gpt-4o-mini",
                    tokens_used=len(email_prompt) + len(formatted_email)
                )
            except Exception as logging_error:
                logger.warning(f"Could not log AI usage: {logging_error}")
            
            logger.info(f"Email formatted successfully using ChatGPT")
            return formatted_email
            
        except Exception as e:
            logger.error(f"Error formatting email with ChatGPT: {str(e)}")
            # Return template with basic formatting if ChatGPT fails
            return f"Dear {customer_name},\n\n{template}\n\nWarm regards,\nThe Veterinary Care Team"
    
    async def generate_sms_content(
        self,
        topic: str,
        custom_topic: Optional[str] = None,
        track_usage: bool = False,
        user_id: Optional[str] = None,
        agent_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate SMS content using AI based on topic"""
        
        try:
            # Use custom topic if provided, otherwise use main topic
            content_topic = custom_topic if custom_topic else topic
            
            # Create SMS generation prompt
            sms_prompt = f"""
            You are a professional SMS content creator for a veterinary clinic.
            
            Topic: {content_topic}
            
            Create a short, engaging SMS message for customers about this topic.
            
            Requirements:
            - Keep it under 160 characters (SMS limit)
            - Use warm but professional tone
            - Include placeholders [CUSTOMER_NAME] and [PET_NAME] for personalization
            - Make it relevant to pet owners and veterinary care
            - End with the clinic signature
            
            Generate only the SMS content, no additional text or explanations.
            """
            
            # Generate SMS content
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"sms_generation_{datetime.now().timestamp()}",
                system_message="You are a professional SMS content creator for a veterinary clinic. Generate concise, engaging SMS messages that are warm but professional and relevant to pet owners."
            ).with_model("openai", "gpt-4o-mini")
            
            # Send message and get response
            user_message = UserMessage(text=sms_prompt)
            response = await chat.send_message(user_message)
            
            sms_content = response.strip()
            
            # Ensure SMS is within character limit
            if len(sms_content) > 160:
                # Truncate and add "..."
                sms_content = sms_content[:157] + "..."
            
            result = {
                "content": sms_content,
                "character_count": len(sms_content)
            }
            
            # Add tracking info if requested
            if track_usage:
                result.update({
                    "track_usage": {
                        "provider": "openai",
                        "model": "gpt-4o-mini", 
                        "user_id": user_id,
                        "agent_id": agent_id
                    },
                    "usage_info": {
                        "prompt_tokens": 0,  # Usage info not available in new response format
                        "completion_tokens": 0,
                        "total_tokens": 0
                    }
                })
            
            logger.info(f"SMS content generated successfully for topic: {content_topic}")
            return result
            
        except Exception as e:
            logger.error(f"Error generating SMS content: {str(e)}")
            # Return fallback SMS content
            fallback_content = f"Hi [CUSTOMER_NAME]! We hope [PET_NAME] is doing well. - Your Vet Team"
            return {
                "content": fallback_content,
                "character_count": len(fallback_content),
                "error": str(e)
            }
    
    async def generate_holiday_specific_content(
        self,
        holiday_name: str,
        holiday_date: str,
        content_type: str = "email",
        word_count: int = 200
    ) -> str:
        """Generate genuinely holiday-specific content for veterinary marketing"""
        
        try:
            if not self.emergent_key:
                logger.error("No Emergent LLM key available for holiday content generation")
                return f"As {holiday_name} approaches, we want to ensure your beloved pets stay safe and happy during this special time."
            
            # Create holiday-specific prompt based on content type
            if content_type == "email":
                prompt = f"""You are an expert veterinary content writer specializing in holiday communications.

Create professional, warm, and genuinely holiday-specific content about {holiday_name} ({holiday_date}) for a veterinary clinic's email marketing.

Holiday Context: {holiday_name} on {holiday_date}

Requirements:
- Write exactly {word_count} words
- Focus specifically on {holiday_name} and how it relates to pet care
- Include holiday-specific pet safety tips relevant to {holiday_name}
- Address potential hazards or concerns specific to this holiday
- Use a warm, caring, professional tone suitable for veterinary communications
- Include practical, actionable advice for pet owners during {holiday_name}
- Make it genuinely relevant to the specific holiday, not generic seasonal content
- Format with proper paragraph structure (use line breaks between paragraphs)
- Do NOT include any greetings, signatures, or placeholders - just the main content

Examples of holiday-specific content:
- For Christmas: Focus on toxic plants, food hazards, decoration dangers
- For Fourth of July: Address fireworks anxiety, heat safety, crowd stress
- For Halloween: Discuss candy toxicity, costume safety, doorbell stress
- For Thanksgiving: Cover food safety, travel stress, rich food dangers

Generate only the main content body - no titles, headers, greetings, or signatures."""

            elif content_type == "marketing":
                prompt = f"""You are an expert veterinary marketing content writer specializing in holiday campaigns.

Create professional, engaging, and genuinely holiday-specific marketing content about {holiday_name} ({holiday_date}) for a veterinary clinic's multi-channel campaign.

Holiday Context: {holiday_name} on {holiday_date}

Requirements:
- Write exactly {word_count} words
- Focus specifically on {holiday_name} and its relevance to pet owners
- Include holiday-specific pet care advice relevant to {holiday_name}
- Address the unique challenges pets face during this specific holiday
- Use an engaging, professional tone suitable for marketing
- Include a subtle call-to-action for veterinary services
- Make it genuinely holiday-specific, not generic seasonal content
- Format with proper paragraph structure (use line breaks between paragraphs)
- Focus on benefits and value for pet owners during {holiday_name}

Examples of holiday-specific marketing:
- For Christmas: Emphasize holiday safety planning, emergency preparedness
- For New Year's: Focus on noise anxiety, resolution for pet health
- For Easter: Address chocolate dangers, spring allergies, outdoor safety
- For Valentine's Day: Discuss chocolate toxicity, romantic plant dangers

Generate only the main marketing content - no titles, headers, or signatures."""

            else:
                # Generic content type
                prompt = f"""You are an expert veterinary content writer specializing in holiday communications.

Create professional, warm, and genuinely holiday-specific content about {holiday_name} ({holiday_date}) for a veterinary clinic.

Holiday Context: {holiday_name} on {holiday_date}

Requirements:
- Write exactly {word_count} words
- Focus specifically on {holiday_name} and its relation to pet care
- Include practical, holiday-specific advice for pet owners
- Address the unique aspects of this holiday that affect pets
- Use a professional, caring tone
- Make it genuinely relevant to the specific holiday
- Format with proper paragraph structure

Generate only the main content body."""

            # Generate holiday-specific content
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"holiday_content_{uuid.uuid4()}",
                system_message=f"You are an expert veterinary content writer who creates genuinely holiday-specific content. You understand the unique challenges and considerations that different holidays present for pet owners and their animals."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            holiday_content = response.strip()
            
            # Clean up any unwanted formatting or artifacts
            import re
            # Remove any remaining markdown formatting
            holiday_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', holiday_content)  # Bold text
            holiday_content = re.sub(r'\*([^*]+)\*', r'\1', holiday_content)    # Italic text
            # Remove any titles or headers that might have been included
            holiday_content = re.sub(r'^Title:.*?\n', '', holiday_content, flags=re.IGNORECASE | re.MULTILINE)
            holiday_content = re.sub(r'^Content:.*?\n', '', holiday_content, flags=re.IGNORECASE | re.MULTILINE)
            holiday_content = holiday_content.strip()
            
            # Ensure proper paragraph formatting if missing
            if '\n' not in holiday_content and len(holiday_content) > 150:
                # Split into sentences and create paragraphs
                sentences = re.split(r'([.!?])\s+', holiday_content)
                formatted_content = ""
                sentence_count = 0
                
                for i in range(0, len(sentences)-1, 2):
                    if i+1 < len(sentences):
                        sentence = sentences[i] + sentences[i+1]
                        formatted_content += sentence
                        sentence_count += 1
                        
                        # Add paragraph break every 2-3 sentences
                        if sentence_count % 3 == 0 and i+2 < len(sentences)-1:
                            formatted_content += "\n\n"
                        else:
                            formatted_content += " "
                
                holiday_content = formatted_content.strip()
            
            if holiday_content and len(holiday_content) > 10:
                logger.info(f"Successfully generated holiday-specific {content_type} content for {holiday_name}")
                return holiday_content
            else:
                logger.warning(f"Generated content too short for {holiday_name}, using fallback")
                return f"As {holiday_name} approaches, we want to ensure your beloved pets stay safe and happy during this special time. Here are some important tips to keep in mind during the holiday season to ensure your furry family members enjoy the festivities safely."
                
        except Exception as e:
            logger.error(f"Error generating holiday-specific content for {holiday_name}: {str(e)}")
            return f"As {holiday_name} approaches, we want to ensure your beloved pets stay safe and happy during this special time. Here are some important tips to keep in mind during the holiday season to ensure your furry family members enjoy the festivities safely."

    async def generate_topic_specific_content(
        self,
        topic: str,
        content_type: str = "email",
        word_count: int = 200
    ) -> str:
        """Generate genuinely topic-specific content for veterinary communications"""
        
        try:
            if not self.emergent_key:
                logger.error("No Emergent LLM key available for topic content generation")
                return f"Learn about {topic} and how it can benefit your pet's health and wellbeing."
            
            # Create topic-specific prompt based on content type
            if content_type == "email":
                prompt = f"""You are an expert veterinary content writer specializing in educational communications.

Create professional, informative, and genuinely topic-specific content about "{topic}" for a veterinary clinic's email newsletter.

Topic Focus: {topic}

Requirements:
- Write exactly {word_count} words
- Focus specifically on {topic} and its importance for pet health
- Include practical, actionable advice for pet owners about {topic}
- Address key aspects, benefits, and considerations related to {topic}
- Use a warm, caring, professional tone suitable for veterinary communications
- Include educational information that pet owners would find valuable
- Make it genuinely relevant to the specific topic, not generic pet care advice
- Format with proper paragraph structure (use line breaks between paragraphs)
- Do NOT include any greetings, signatures, or placeholders - just the main content

Examples of topic-specific content:
- For "Pet Dental Care": Focus on dental hygiene, cleaning techniques, warning signs
- For "Pet Nutrition": Discuss proper feeding, nutritional needs, food safety
- For "Vaccination": Cover vaccine schedules, importance, side effects
- For "Senior Pet Care": Address age-related health issues, comfort measures

Generate only the main content body - no titles, headers, greetings, or signatures."""

            elif content_type == "marketing":
                prompt = f"""You are an expert veterinary marketing content writer specializing in educational campaigns.

Create professional, engaging, and genuinely topic-specific marketing content about "{topic}" for a veterinary clinic's multi-channel campaign.

Topic Focus: {topic}

Requirements:
- Write exactly {word_count} words
- Focus specifically on {topic} and its value for pet owners
- Include topic-specific benefits and practical advice about {topic}
- Address why {topic} is important for pet health and owner peace of mind
- Use an engaging, professional tone suitable for marketing
- Include a subtle call-to-action for related veterinary services
- Make it genuinely topic-specific, not generic pet care content
- Format with proper paragraph structure (use line breaks between paragraphs)
- Focus on benefits and value proposition related to {topic}

Examples of topic-specific marketing:
- For "Pet Dental Care": Emphasize dental health benefits, prevention value
- For "Emergency Preparedness": Focus on peace of mind, readiness benefits
- For "Wellness Exams": Highlight early detection, preventive care value
- For "Pet Insurance": Discuss financial protection, care accessibility

Generate only the main marketing content - no titles, headers, or signatures."""

            else:
                # Generic content type
                prompt = f"""You are an expert veterinary content writer specializing in educational communications.

Create professional, informative, and genuinely topic-specific content about "{topic}" for a veterinary clinic.

Topic Focus: {topic}

Requirements:
- Write exactly {word_count} words
- Focus specifically on {topic} and its relevance to pet care
- Include practical, topic-specific advice for pet owners
- Address the key aspects and importance of {topic}
- Use a professional, caring tone
- Make it genuinely relevant to the specific topic
- Format with proper paragraph structure

Generate only the main content body."""

            # Generate topic-specific content
            chat = LlmChat(
                api_key=self.emergent_key,
                session_id=f"topic_content_{uuid.uuid4()}",
                system_message=f"You are an expert veterinary content writer who creates genuinely topic-specific content. You understand the importance of providing valuable, educational information about specific veterinary topics that help pet owners make informed decisions about their pets' health."
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            topic_content = response.strip()
            
            # Clean up any unwanted formatting or artifacts
            import re
            # Remove any remaining markdown formatting
            topic_content = re.sub(r'\*\*([^*]+)\*\*', r'\1', topic_content)  # Bold text
            topic_content = re.sub(r'\*([^*]+)\*', r'\1', topic_content)    # Italic text
            # Remove any titles or headers that might have been included
            topic_content = re.sub(r'^Title:.*?\n', '', topic_content, flags=re.IGNORECASE | re.MULTILINE)
            topic_content = re.sub(r'^Content:.*?\n', '', topic_content, flags=re.IGNORECASE | re.MULTILINE)
            topic_content = topic_content.strip()
            
            # Ensure proper paragraph formatting if missing
            if '\n' not in topic_content and len(topic_content) > 150:
                # Split into sentences and create paragraphs
                sentences = re.split(r'([.!?])\s+', topic_content)
                formatted_content = ""
                sentence_count = 0
                
                for i in range(0, len(sentences)-1, 2):
                    if i+1 < len(sentences):
                        sentence = sentences[i] + sentences[i+1]
                        formatted_content += sentence
                        sentence_count += 1
                        
                        # Add paragraph break every 2-3 sentences
                        if sentence_count % 3 == 0 and i+2 < len(sentences)-1:
                            formatted_content += "\n\n"
                        else:
                            formatted_content += " "
                
                topic_content = formatted_content.strip()
            
            if topic_content and len(topic_content) > 10:
                logger.info(f"Successfully generated topic-specific {content_type} content for {topic}")
                return topic_content
            else:
                logger.warning(f"Generated content too short for {topic}, using fallback")
                return f"Learn about {topic} and how it can benefit your pet's health and wellbeing. Our expert team provides comprehensive guidance and care to help you understand the importance of {topic} for your furry family member's overall health and happiness."
                
        except Exception as e:
            logger.error(f"Error generating topic-specific content for {topic}: {str(e)}")
            return f"Learn about {topic} and how it can benefit your pet's health and wellbeing. Our expert team provides comprehensive guidance and care to help you understand the importance of {topic} for your furry family member's overall health and happiness."

# Global instance
ai_service = AIContentGenerator()

async def generate_content_for_write_post(title: str, existing_content: str = "", word_count: str = "100", use_web_research: bool = False):
    """
    Generate content for Write Your Post agents
    
    Args:
        title: Post title provided by user
        existing_content: Existing content provided by user (if any)
        word_count: Target word count
        use_web_research: Whether to use web research
        
    Returns:
        dict: Generated content result
    """
    try:
        logger.info(f"Generating content for Write Your Post: {title}")
        
        # Build the prompt based on provided content
        if existing_content and existing_content.strip():
            # User provided content - enhance/refine it
            prompt = f"""
You are a professional social media content creator for a veterinary hospital.

Title: {title}
Existing Content: {existing_content}

Please enhance and refine the provided content to make it more engaging for social media while maintaining the original message. The content should be approximately {word_count} words.

Requirements:
- Keep the original meaning and key points
- Make it more engaging and social media friendly
- Use appropriate veterinary language but keep it accessible
- Include relevant hashtags if appropriate
- Maintain a warm, professional tone

Enhanced Content:"""
        else:
            # No existing content - generate from scratch
            prompt = f"""
You are a professional social media content creator for a veterinary hospital.

Title: {title}

Please create engaging social media content based on this title. The content should be approximately {word_count} words and suitable for veterinary hospital social media accounts.

Requirements:
- Create informative and engaging content
- Use professional but accessible language
- Include practical tips or insights when relevant
- Maintain a warm, caring tone appropriate for pet owners
- Include relevant hashtags if appropriate
- Focus on pet health, care, or veterinary services

Content:"""

        # Use web research if enabled
        if use_web_research:
            prompt += f"\n\nNote: Please incorporate current best practices and recent veterinary insights when creating this content about: {title}"
        
        # Generate content using the AI service
        content = await ai_service.generate_content(
            topic=title,
            word_count=word_count,
            custom_prompt=prompt
        )
        
        if content:
            return {
                "content": content,
                "word_count": len(content.split()),
                "success": True
            }
        else:
            logger.error("Failed to generate content for Write Your Post")
            return {
                "content": existing_content or f"Content for: {title}",
                "word_count": len((existing_content or title).split()),
                "success": False,
                "error": "Failed to generate content"
            }
            
    except Exception as e:
        logger.error(f"Error generating content for Write Your Post: {str(e)}")
        return {
            "content": existing_content or f"Content for: {title}",
            "word_count": len((existing_content or title).split()),
            "success": False,
            "error": str(e)
        }

# Function to be called from server.py
async def format_email_content(template: str, customer_name: str, pet_names: str, holiday_name: str, holiday_date: str) -> str:
    """Global function to format email content"""
    return await ai_service.format_email_content(template, customer_name, pet_names, holiday_name, holiday_date)

async def format_topic_email_content(template: str, customer_name: str, pet_names: str, topic: str) -> str:
    """Global function to format topic-based email content"""
    return await ai_service.format_topic_email_content(template, customer_name, pet_names, topic)

async def generate_holiday_specific_content(holiday_name: str, holiday_date: str, content_type: str = "email", word_count: int = 200) -> str:
    """Generate genuinely holiday-specific content for veterinary marketing"""
    return await ai_service.generate_holiday_specific_content(holiday_name, holiday_date, content_type, word_count)

async def generate_topic_specific_content(topic: str, content_type: str = "email", word_count: int = 200) -> str:
    """Generate genuinely topic-specific content for veterinary communications"""
    return await ai_service.generate_topic_specific_content(topic, content_type, word_count)