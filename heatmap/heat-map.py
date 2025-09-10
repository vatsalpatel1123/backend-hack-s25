import streamlit as st
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.ndimage import gaussian_filter
import random
import io
import base64
import requests
import json
from datetime import datetime, timezone
import pandas as pd

# API Configuration
API_BASE_URL = "http://localhost:8005"

class MultiCameraCrowdAnalyzer:
    def __init__(self):
        self.cameras = {}
        self.crowd_levels = {}
    
    def create_sample_camera_feed(self, camera_id, crowd_density='medium'):
        """Create sample camera feed with different crowd densities"""
        width, height = 400, 300
        
        # Create base image (representing camera view)
        img = Image.new('RGB', (width, height), color=(240, 240, 240))
        draw = ImageDraw.Draw(img)
        
        # Add camera frame
        draw.rectangle([0, 0, width-1, height-1], outline=(0, 0, 0), width=3)
        
        # Add camera label
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        draw.text((10, 10), f"Camera {camera_id}", fill=(0, 0, 0), font=font)
        
        # Generate people based on density
        if crowd_density == 'high':
            num_people = random.randint(15, 25)
            colors = [(255, 0, 0), (255, 100, 100), (200, 0, 0)]  # Red shades
        elif crowd_density == 'medium':
            num_people = random.randint(8, 15)
            colors = [(255, 165, 0), (255, 200, 0), (200, 150, 0)]  # Orange shades
        else:  # low
            num_people = random.randint(2, 8)
            colors = [(0, 255, 0), (100, 255, 100), (0, 200, 0)]  # Green shades
        
        # Add people as colored dots/rectangles
        people_positions = []
        for i in range(num_people):
            x = random.randint(20, width-40)
            y = random.randint(50, height-30)
            color = random.choice(colors)
            
            # Draw person as small rectangle
            draw.rectangle([x, y, x+15, y+25], fill=color, outline=(0, 0, 0))
            people_positions.append((x, y))
        
        return np.array(img), people_positions, num_people
    
    def generate_heatmap_from_positions(self, width, height, positions):
        """Generate heatmap from people positions"""
        heatmap = np.zeros((height, width), dtype=np.float32)
        
        for x, y in positions:
            # Add heat around each person
            heat_radius = 20
            y_start = max(0, y - heat_radius)
            y_end = min(height, y + heat_radius)
            x_start = max(0, x - heat_radius)
            x_end = min(width, x + heat_radius)
            
            # Create circular heat pattern
            for py in range(y_start, y_end):
                for px in range(x_start, x_end):
                    distance = np.sqrt((px - x)**2 + (py - y)**2)
                    if distance <= heat_radius:
                        heat_value = max(0, 1 - distance/heat_radius)
                        heatmap[py, px] += heat_value
        
        # Apply Gaussian smoothing
        heatmap = gaussian_filter(heatmap, sigma=8)
        return heatmap
    
    def analyze_crowd_density(self, people_count, heatmap):
        """Analyze crowd density and provide score"""
        max_density = np.max(heatmap)
        mean_density = np.mean(heatmap[heatmap > 0]) if np.any(heatmap > 0) else 0
        
        # Calculate crowd score (0-100)
        crowd_score = min(100, (people_count * 3) + (max_density * 20) + (mean_density * 10))
        
        if crowd_score >= 70:
            level = "HIGH"
            color = "🔴"
            priority = "URGENT"
        elif crowd_score >= 40:
            level = "MEDIUM"
            color = "🟡"
            priority = "MONITOR"
        else:
            level = "LOW"
            color = "🟢"
            priority = "NORMAL"
        
        return {
            'score': round(crowd_score, 1),
            'level': level,
            'color': color,
            'priority': priority,
            'people_count': people_count,
            'max_density': float(max_density),
            'mean_density': float(mean_density)
        }

def create_sample_images():
    """Create 12 sample camera feeds with different crowd densities"""
    analyzer = MultiCameraCrowdAnalyzer()
    
    # Define camera scenarios
    camera_scenarios = [
        ('Ram Ghat', 'high'),
        ('Harsiddhi Ghat', 'medium'),
        ('Kailash Ghat', 'low'),
        ('Patal Ghat', 'high'),
        ('Ganga Ghat', 'high'),
        ('Dutta Akhada Ghat', 'medium'),
        ('Narsingh Ghat', 'low'),
        ('Siddhavat Ghat', 'medium'),
        ('Bhairo Ghat', 'high'),
        ('Mangalnath Ghat', 'medium'),
        ('Triveni Ghat', 'low'),
        ('Chintaman Ghat', 'high')
    ]
    
    camera_data = {}
    
    for camera_id, density in camera_scenarios:
        img, positions, people_count = analyzer.create_sample_camera_feed(camera_id, density)
        heatmap = analyzer.generate_heatmap_from_positions(400, 300, positions)
        analysis = analyzer.analyze_crowd_density(people_count, heatmap)
        
        camera_data[camera_id] = {
            'image': img,
            'heatmap': heatmap,
            'positions': positions,
            'analysis': analysis,
            'density_type': density
        }
    
    return camera_data

def store_data_to_api(camera_data):
    """Store camera data to API"""
    try:
        # Prepare data for API
        api_data = []
        current_time = datetime.now(timezone.utc).isoformat()
        
        for camera_id, data in camera_data.items():
            camera_record = {
                "camera_id": camera_id.replace(" ", "_").lower(),
                "camera_name": camera_id,
                "density_type": data['density_type'],
                "analysis": data['analysis'],
                "timestamp": current_time
            }
            api_data.append(camera_record)
        
        # Send to API
        response = requests.post(
            f"{API_BASE_URL}/cameras/data",
            json=api_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Failed to store data: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to API. Make sure the FastAPI server is running on port 8005.")
        return None
    except Exception as e:
        st.error(f"Error storing data: {str(e)}")
        return None

def get_latest_data_from_api():
    """Get latest camera data from API"""
    try:
        response = requests.get(f"{API_BASE_URL}/cameras/latest")
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"Failed to fetch data: {response.text}")
            return None
    except requests.exceptions.ConnectionError:
        st.error("❌ Cannot connect to API. Make sure the FastAPI server is running on port 8005.")
        return None
    except Exception as e:
        st.error(f"Error fetching data: {str(e)}")
        return None

def get_system_overview():
    """Get system overview from API"""
    try:
        response = requests.get(f"{API_BASE_URL}/system/overview")
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except:
        return None

def get_alerts():
    """Get active alerts from API"""
    try:
        response = requests.get(f"{API_BASE_URL}/alerts")
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except:
        return None

def check_api_health():
    """Check if API is running"""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    st.set_page_config(
        page_title="Multi-Camera Crowd Monitor",
        page_icon="📹",
        layout="wide"
    )
    
    # Header
    st.title("📹 Multi-Camera Crowd Monitoring System")
    st.markdown("### Real-time Crowd Detection & Ranking Dashboard with Database Integration")
    
    # Check API health
    api_healthy = check_api_health()
    if api_healthy:
        st.success("✅ Connected to API Server")
    else:
        st.error("❌ API Server not available. Running in offline mode.")
    
    # Control Panel
    col_control1, col_control2, col_control3, col_control4 = st.columns(4)
    
    with col_control1:
        if st.button("🔄 Generate New Data", type="primary"):
            with st.spinner("Generating new camera data..."):
                camera_data = create_sample_images()
                st.session_state.camera_data = camera_data
                
                # Store to database if API is available
                if api_healthy:
                    result = store_data_to_api(camera_data)
                    if result:
                        st.success(f"✅ Data stored to database: {result['stored_count']} cameras")
                st.rerun()
    
    with col_control2:
        if st.button("📥 Load from Database") and api_healthy:
            with st.spinner("Loading data from database..."):
                db_data = get_latest_data_from_api()
                if db_data:
                    st.success(f"✅ Loaded {len(db_data)} cameras from database")
                    st.session_state.db_data = db_data
                else:
                    st.error("Failed to load data from database")
    
    with col_control3:
        view_mode = st.selectbox("View Mode", ["Grid View", "Ranking View", "Heatmap View", "Database View"])
    
    with col_control4:
        alert_threshold = st.slider("Alert Threshold", 0, 100, 70)
    
    # Initialize data
    if 'camera_data' not in st.session_state:
        st.session_state.camera_data = create_sample_images()
    
    camera_data = st.session_state.camera_data
    
    # Show system overview if API is available
    if api_healthy:
        overview = get_system_overview()
        if overview:
            st.markdown("### 📊 System Overview")
            overview_cols = st.columns(6)
            
            with overview_cols[0]:
                st.metric("Total Cameras", overview['total_cameras'])
            with overview_cols[1]:
                st.metric("Total People", overview['total_people'])
            with overview_cols[2]:
                st.metric("High Density", overview['high_density_cameras'])
            with overview_cols[3]:
                st.metric("Avg Score", f"{overview['average_score']}")
            with overview_cols[4]:
                st.metric("Critical", overview['critical_cameras'])
            with overview_cols[5]:
                st.metric("Active Alerts", overview['active_alerts'])
            
            st.markdown("---")
    
    # Alert Panel
    if api_healthy:
        alerts = get_alerts()
        if alerts and len(alerts) > 0:
            st.error(f"🚨 ALERT: {len(alerts)} active alerts!")
            with st.expander("View Active Alerts", expanded=True):
                for alert in alerts[:5]:  # Show top 5 alerts
                    severity_color = "🔴" if alert['severity'] == "HIGH" else "🟡"
                    st.write(f"{severity_color} **{alert['camera_name']}**: {alert['message']}")
    
    # Database View
    if view_mode == "Database View" and api_healthy:
        st.subheader("💾 Database Records")
        
        db_data = get_latest_data_from_api()
        if db_data:
            # Convert to DataFrame for better display
            df = pd.DataFrame(db_data)
            
            # Format columns for better display
            df['timestamp'] = pd.to_datetime(df['timestamp']).dt.strftime('%Y-%m-%d %H:%M:%S')
            df['created_at'] = pd.to_datetime(df['created_at']).dt.strftime('%Y-%m-%d %H:%M:%S')
            
            # Select columns to display
            display_cols = ['camera_name', 'score', 'level', 'people_count', 'priority', 'timestamp']
            st.dataframe(df[display_cols], use_container_width=True)
            
            # Download data
            csv = df.to_csv(index=False)
            st.download_button(
                label="📊 Download CSV",
                data=csv,
                file_name=f"camera_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
        else:
            st.info("No data found in database. Generate and store some data first.")
    
    # Create ranking for other views
    if view_mode != "Database View":
        rankings = []
        for camera_id, data in camera_data.items():
            rankings.append({
                'camera_id': camera_id,
                'score': data['analysis']['score'],
                'level': data['analysis']['level'],
                'color': data['analysis']['color'],
                'priority': data['analysis']['priority'],
                'people_count': data['analysis']['people_count']
            })
        
        # Sort by score (highest first)
        rankings.sort(key=lambda x: x['score'], reverse=True)
        
        # Alert Panel for local data
        high_risk_cameras = [r for r in rankings if r['score'] >= alert_threshold]
        if high_risk_cameras and not api_healthy:
            st.error(f"🚨 ALERT: {len(high_risk_cameras)} cameras showing high crowd density!")
            alert_text = ", ".join([f"Camera {r['camera_id']}" for r in high_risk_cameras[:3]])
            st.write(f"**Immediate Attention Required:** {alert_text}")
    
        # Main Dashboard
        if view_mode == "Ranking View":
            st.subheader("📊 Camera Ranking by Crowd Density")
            
            # Top 3 cameras
            st.markdown("### 🏆 Top Priority Cameras")
            top_cols = st.columns(3)
            
            for i, camera in enumerate(rankings[:3]):
                with top_cols[i]:
                    rank_medal = ["🥇", "🥈", "🥉"][i]
                    st.metric(
                        label=f"{rank_medal} Camera {camera['camera_id']}", 
                        value=f"{camera['score']}/100",
                        delta=f"{camera['people_count']} people"
                    )
                    
                    # Show camera image
                    img = camera_data[camera['camera_id']]['image']
                    st.image(img, caption=f"Camera {camera['camera_id']} - {camera['level']}")
            
            # Full ranking table
            st.markdown("### 📋 Complete Ranking")
            ranking_data = []
            for i, camera in enumerate(rankings):
                ranking_data.append({
                    'Rank': i + 1,
                    'Camera ID': camera['camera_id'],
                    'Status': f"{camera['color']} {camera['level']}",
                    'Crowd Score': camera['score'],
                    'People Count': camera['people_count'],
                    'Priority': camera['priority']
                })
            
            st.dataframe(ranking_data, use_container_width=True)
            
        elif view_mode == "Grid View":
            st.subheader("🎛️ All Camera Feeds")
            
            # Display all cameras in grid
            cols = st.columns(4)
            for i, (camera_id, data) in enumerate(camera_data.items()):
                with cols[i % 4]:
                    analysis = data['analysis']
                    st.markdown(f"**Camera {camera_id}** {analysis['color']}")
                    st.image(data['image'])
                    st.write(f"Score: {analysis['score']}/100")
                    st.write(f"People: {analysis['people_count']}")
                    st.write(f"Level: {analysis['level']}")
        
        else:  # Heatmap View
            st.subheader("🔥 Heatmap Analysis")
            
            # Select camera for detailed heatmap
            selected_camera = st.selectbox(
                "Select Camera for Detailed Analysis",
                list(camera_data.keys()),
                format_func=lambda x: f"Camera {x} (Score: {camera_data[x]['analysis']['score']})"
            )
            
            col_heat1, col_heat2 = st.columns(2)
            
            with col_heat1:
                st.markdown(f"### Original Feed - Camera {selected_camera}")
                st.image(camera_data[selected_camera]['image'])
                
                # Analysis details
                analysis = camera_data[selected_camera]['analysis']
                st.markdown("#### Analysis Results")
                st.write(f"**Crowd Score:** {analysis['score']}/100")
                st.write(f"**Density Level:** {analysis['color']} {analysis['level']}")
                st.write(f"**People Detected:** {analysis['people_count']}")
                st.write(f"**Priority:** {analysis['priority']}")
            
            with col_heat2:
                st.markdown(f"### Heat Map - Camera {selected_camera}")
                
                # Create heatmap visualization
                fig, ax = plt.subplots(figsize=(8, 6))
                
                heatmap = camera_data[selected_camera]['heatmap']
                im = ax.imshow(heatmap, cmap='hot', alpha=0.8)
                
                # Overlay original image with transparency
                original_img = camera_data[selected_camera]['image']
                ax.imshow(original_img, alpha=0.3)
                
                ax.set_title(f'Camera {selected_camera} - Heat Map Analysis')
                ax.axis('off')
                
                plt.colorbar(im, ax=ax, label='Crowd Density')
                st.pyplot(fig)
                plt.close()
        
        # Summary Statistics for local data
        if not api_healthy:
            st.markdown("---")
            st.subheader("📈 System Overview (Local Data)")
            
            summary_cols = st.columns(4)
            
            with summary_cols[0]:
                total_people = sum([r['people_count'] for r in rankings])
                st.metric("Total People Detected", total_people)
            
            with summary_cols[1]:
                high_density = len([r for r in rankings if r['level'] == 'HIGH'])
                st.metric("High Density Cameras", high_density)
            
            with summary_cols[2]:
                avg_score = sum([r['score'] for r in rankings]) / len(rankings)
                st.metric("Average Crowd Score", f"{avg_score:.1f}")
            
            with summary_cols[3]:
                critical_cameras = len([r for r in rankings if r['score'] >= 80])
                st.metric("Critical Cameras", critical_cameras)
    
    # Export section
    st.markdown("---")
    st.subheader("💾 Export & Reports")
    
    col_export1, col_export2 = st.columns(2)
    
    with col_export1:
        if st.button("📊 Generate Local Report"):
            if view_mode != "Database View":
                report_data = {
                    'timestamp': datetime.now().isoformat(),
                    'total_cameras': len(camera_data),
                    'rankings': rankings,
                    'alerts': len(high_risk_cameras) if high_risk_cameras else 0,
                    'api_connected': api_healthy,
                    'recommendations': [
                        "Deploy security personnel to high-density areas",
                        "Monitor top-ranked cameras closely",
                        "Consider crowd flow management",
                        "Update alert thresholds based on patterns"
                    ]
                }
                
                st.json(report_data)
                st.success("✅ Local report generated successfully!")
    
    with col_export2:
        if api_healthy and st.button("🗂️ Download Database Report"):
            db_data = get_latest_data_from_api()
            if db_data:
                # Create comprehensive report
                df = pd.DataFrame(db_data)
                csv = df.to_csv(index=False)
                
                st.download_button(
                    label="📊 Download Database CSV",
                    data=csv,
                    file_name=f"crowd_monitoring_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                    mime="text/csv"
                )
                st.success("✅ Database report ready for download!")

if __name__ == "__main__":
    main()
