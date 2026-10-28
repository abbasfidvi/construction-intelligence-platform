import io
import base64
from PIL import Image, ImageDraw, ImageFont

def create_sample_safety_image():
    # 800x500 construction site with scaffolding, worker, edge
    img = Image.new("RGB", (800, 500), color=(140, 160, 175))
    draw = ImageDraw.Draw(img)
    
    # Sky / background building
    draw.rectangle([0, 0, 800, 200], fill=(175, 195, 215))
    # Concrete structural frame
    draw.rectangle([50, 100, 750, 480], fill=(185, 185, 180), outline=(100, 100, 100), width=4)
    # Columns
    for x in [80, 280, 480, 680]:
        draw.rectangle([x, 100, x + 40, 480], fill=(160, 160, 155), outline=(90, 90, 90), width=2)
    # Beams
    draw.rectangle([50, 220, 750, 260], fill=(150, 150, 145), outline=(80, 80, 80), width=2)
    draw.rectangle([50, 360, 750, 400], fill=(150, 150, 145), outline=(80, 80, 80), width=2)
    
    # Scaffolding on right side (yellow/metallic pipes)
    for sx in [520, 580, 640]:
        draw.line([sx, 120, sx, 480], fill=(220, 180, 40), width=4)
    for sy in [150, 220, 290, 360, 430]:
        draw.line([510, sy, 650, sy], fill=(220, 180, 40), width=3)
    # Missing cross-braces warning
    draw.line([520, 150, 580, 220], fill=(220, 180, 40), width=3)
    # Unguarded edge on upper deck (missing guardrails)
    draw.line([120, 220, 480, 220], fill=(200, 50, 50), width=5) # Red danger line
    
    # Worker at elevated deck without harness
    # Head + hardhat (yellow)
    draw.ellipse([340, 170, 360, 190], fill=(245, 200, 30))
    # Body (orange vest)
    draw.rectangle([342, 190, 358, 215], fill=(255, 95, 0))
    # Legs
    draw.line([345, 215, 345, 235], fill=(50, 70, 110), width=4)
    draw.line([355, 215, 355, 235], fill=(50, 70, 110), width=4)
    
    # Caution marker text
    draw.text((60, 30), "CONSTRUCTION SITE SAFETY INSPECTION - ACTIVE ZONE 4", fill=(20, 30, 40))
    draw.text((130, 195), "UNPROTECTED LEADING EDGE - NO TIE-OFF", fill=(180, 20, 20))
    draw.text((530, 130), "SCAFFOLD SECTION B", fill=(30, 30, 30))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

def create_sample_crack_image():
    # 800x500 concrete beam with diagonal shear crack
    img = Image.new("RGB", (800, 500), color=(190, 192, 195))
    draw = ImageDraw.Draw(img)
    
    # Concrete texture / beam outline
    draw.rectangle([40, 60, 760, 440], fill=(175, 178, 180), outline=(90, 92, 95), width=6)
    
    # Diagonal Shear Crack propagating across beam web at 45 degrees
    crack_points = [
        (180, 410), (220, 370), (240, 355), (280, 310), (310, 280),
        (350, 250), (370, 240), (420, 200), (460, 170), (510, 140), (550, 115), (590, 95)
    ]
    # Draw dark jagged crack line
    draw.line(crack_points, fill=(35, 35, 35), width=5)
    # Secondary crack branches
    draw.line([(310, 280), (340, 315), (370, 330)], fill=(50, 50, 50), width=3)
    draw.line([(460, 170), (490, 195), (520, 210)], fill=(50, 50, 50), width=2)
    
    # Measurement ruler scale placed on concrete for visual inspection
    draw.rectangle([600, 280, 630, 410], fill=(240, 240, 230), outline=(30, 30, 30), width=2)
    for y in range(290, 410, 10):
        draw.line([600, y, 615, y], fill=(20, 20, 20), width=1)
    draw.text((640, 340), "SCALE: 2.4mm Crack Width", fill=(20, 20, 20))
    
    # Inspector label
    draw.text((50, 20), "STRUCTURAL DEFECT INSPECTION - GIRDER G-12 (ACI 224 DIAGNOSTIC)", fill=(20, 20, 20))
    draw.text((260, 450), "DIAGONAL SHEAR TRAJECTORY (45 DEG)", fill=(180, 20, 20))
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("utf-8")

if __name__ == "__main__":
    safety_b64 = create_sample_safety_image()
    crack_b64 = create_sample_crack_image()
    
    out_code = f'''# Auto-generated sample base64 images for 1-click test runs
SAMPLE_SAFETY_IMAGE_B64 = "{safety_b64}"

SAMPLE_CRACK_IMAGE_B64 = "{crack_b64}"
'''
    with open("C:/Users/Admin/Desktop/construction-intelligence-platform/backend/sample_assets/sample_data.py", "w") as f:
        f.write(out_code)
    print("Sample base64 assets generated successfully.")
