import sys
import json
import pandas as pd

def get_recommendations(district):
    try:
        # Load training data
        df = pd.read_csv('ml/data/training_data.csv')
        
        # Filter by district
        district_data = df[df['district'] == district]
        
        if district_data.empty:
            raise ValueError(f"No data found for district: {district}")
        
        # Calculate average production by rice type
        rice_stats = district_data.groupby('rice_type_name').agg({
            'quantity_kg': ['mean', 'count']
        }).reset_index()
        
        rice_stats.columns = ['rice_type', 'avg_production', 'sample_count']
        
        # Sort by average production and get top 3
        top_rice_types = rice_stats.nlargest(3, 'avg_production')
        
        # Prepare recommendations
        recommendations = []
        for idx, row in top_rice_types.iterrows():
            recommendations.append({
                "rice_type": row['rice_type'],
                "avg_production": round(float(row['avg_production']), 2),
                "sample_count": int(row['sample_count']),
                "recommendation": f"High-yielding variety with average of {round(float(row['avg_production']), 2)} kg per harvest"
            })
        
        result = {
            "success": True,
            "district": district,
            "recommendations": recommendations
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: python recommendations.py <district>"}), file=sys.stderr)
        sys.exit(1)
    
    district = sys.argv[1]
    get_recommendations(district)
