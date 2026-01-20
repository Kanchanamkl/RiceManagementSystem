# ml/scripts/recommendations.py
import sys
import json
import pandas as pd
import os

def get_recommendations(district):
    try:
        # Get correct path
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(os.path.dirname(script_dir))
        data_path = os.path.join(project_root, 'ml', 'data', 'rice_statistics_rice_type_based.csv')
        
        # Load training data
        try:
            df = pd.read_csv(data_path, encoding='utf-8')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(data_path, encoding='latin-1')
            except:
                df = pd.read_csv(data_path, encoding='cp1252')
        
        # Filter by district
        district_data = df[df['district'] == district]
        
        if district_data.empty:
            return {
                'error': f'No data found for district: {district}',
                'available_districts': df['district'].unique().tolist()
            }
        
        # Calculate average yield per rice type
        avg_by_type = district_data.groupby('rice_type_name')['quantity_kg'].agg(['mean', 'count', 'max']).reset_index()
        avg_by_type.columns = ['rice_type', 'avg_quantity', 'count', 'max_quantity']
        
        # Sort by average quantity
        top_types = avg_by_type.nlargest(3, 'avg_quantity')
        
        recommendations = []
        for idx, row in top_types.iterrows():
            recommendations.append({
                'rice_type': row['rice_type'],
                'avg_production': int(row['avg_quantity']),
                'max_production': int(row['max_quantity']),
                'sample_count': int(row['count']),
                'recommendation': f"High yield potential - Avg {int(row['avg_quantity']):,} kg per season"
            })
        
        return {
            'district': district,
            'total_records': len(district_data),
            'recommendations': recommendations
        }
    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(json.dumps({'error': 'Usage: python recommendations.py <district>'}))
        sys.exit(1)
    
    district = sys.argv[1]
    result = get_recommendations(district)
    print(json.dumps(result))