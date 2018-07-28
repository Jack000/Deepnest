#include <nan.h>
#include "minkowski.h"

#include <iostream>
#include <boost/polygon/polygon.hpp>
#include <string>
#include <iostream>
#include <sstream>
#include <limits>

#undef min
#undef max

typedef boost::polygon::point_data<int> point;
typedef boost::polygon::polygon_set_data<int> polygon_set;
typedef boost::polygon::polygon_with_holes_data<int> polygon;
typedef std::pair<point, point> edge;
using namespace boost::polygon::operators;

void convolve_two_segments(std::vector<point>& figure, const edge& a, const edge& b) {
  using namespace boost::polygon;
  figure.clear();
  figure.push_back(point(a.first));
  figure.push_back(point(a.first));
  figure.push_back(point(a.second));
  figure.push_back(point(a.second));
  convolve(figure[0], b.second);
  convolve(figure[1], b.first);
  convolve(figure[2], b.first);
  convolve(figure[3], b.second);
}

template <typename itrT1, typename itrT2>
void convolve_two_point_sequences(polygon_set& result, itrT1 ab, itrT1 ae, itrT2 bb, itrT2 be) {
  using namespace boost::polygon;
  if(ab == ae || bb == be)
    return;
  point first_a = *ab;
  point prev_a = *ab;
  std::vector<point> vec;
  polygon poly;
  ++ab;
  for( ; ab != ae; ++ab) {
    point first_b = *bb;
    point prev_b = *bb;
    itrT2 tmpb = bb;
    ++tmpb;
    for( ; tmpb != be; ++tmpb) {
      convolve_two_segments(vec, std::make_pair(prev_b, *tmpb), std::make_pair(prev_a, *ab));
      set_points(poly, vec.begin(), vec.end());
      result.insert(poly);
      prev_b = *tmpb;
    }
    prev_a = *ab;
  }
}

template <typename itrT>
void convolve_point_sequence_with_polygons(polygon_set& result, itrT b, itrT e, const std::vector<polygon>& polygons) {
  using namespace boost::polygon;
  for(std::size_t i = 0; i < polygons.size(); ++i) {
    convolve_two_point_sequences(result, b, e, begin_points(polygons[i]), end_points(polygons[i]));
    for(polygon_with_holes_traits<polygon>::iterator_holes_type itrh = begin_holes(polygons[i]);
        itrh != end_holes(polygons[i]); ++itrh) {
      convolve_two_point_sequences(result, b, e, begin_points(*itrh), end_points(*itrh));
    }
  }
}

void convolve_two_polygon_sets(polygon_set& result, const polygon_set& a, const polygon_set& b) {
  using namespace boost::polygon;
  result.clear();
  std::vector<polygon> a_polygons;
  std::vector<polygon> b_polygons;
  a.get(a_polygons);
  b.get(b_polygons);
  for(std::size_t ai = 0; ai < a_polygons.size(); ++ai) {
    convolve_point_sequence_with_polygons(result, begin_points(a_polygons[ai]), 
                                          end_points(a_polygons[ai]), b_polygons);
    for(polygon_with_holes_traits<polygon>::iterator_holes_type itrh = begin_holes(a_polygons[ai]);
        itrh != end_holes(a_polygons[ai]); ++itrh) {
      convolve_point_sequence_with_polygons(result, begin_points(*itrh), 
                                            end_points(*itrh), b_polygons);
    }
    for(std::size_t bi = 0; bi < b_polygons.size(); ++bi) {
      polygon tmp_poly = a_polygons[ai];
      result.insert(convolve(tmp_poly, *(begin_points(b_polygons[bi]))));
      tmp_poly = b_polygons[bi];
      result.insert(convolve(tmp_poly, *(begin_points(a_polygons[ai]))));
    }
  }
}

double inputscale;

using v8::Local;
using v8::Array;
using v8::Isolate;
using v8::String;
using v8::Handle;
using v8::Object;
using v8::Value;

using namespace boost::polygon;

NAN_METHOD(calculateNFP) {
  //std::stringstream buffer;
  //std::streambuf * old = std::cout.rdbuf(buffer.rdbuf());
  
  Isolate* isolate = info.GetIsolate();

  Handle<Object> group = Handle<Object>::Cast(info[0]);
  Handle<Array> A = Handle<Array>::Cast(group->Get(String::NewFromUtf8(isolate,"A")));
  Handle<Array> B = Handle<Array>::Cast(group->Get(String::NewFromUtf8(isolate,"B")));
  
  polygon_set a, b, c;
  std::vector<polygon> polys;
  std::vector<point> pts;
  
  // get maximum bounds for scaling factor
  unsigned int len = A->Length();
  double Amaxx = 0;
  double Aminx = 0;
  double Amaxy = 0;
  double Aminy = 0;
  for (unsigned int i = 0; i < len; i++) {
  	Local<Object> obj = Local<Object>::Cast(A->Get(i));
  	Amaxx = (std::max)(Amaxx, (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
  	Aminx = (std::min)(Aminx, (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
  	Amaxy = (std::max)(Amaxy, (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
  	Aminy = (std::min)(Aminy, (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
  }
  
  len = B->Length();
  double Bmaxx = 0;
  double Bminx = 0;
  double Bmaxy = 0;
  double Bminy = 0;
  for (unsigned int i = 0; i < len; i++) {
  	Local<Object> obj = Local<Object>::Cast(B->Get(i));
  	Bmaxx = (std::max)(Bmaxx, (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
  	Bminx = (std::min)(Bminx, (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
  	Bmaxy = (std::max)(Bmaxy, (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
  	Bminy = (std::min)(Bminy, (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
  }
  
  double Cmaxx = Amaxx + Bmaxx;
  double Cminx = Aminx + Bminx;
  double Cmaxy = Amaxy + Bmaxy;
  double Cminy = Aminy + Bminy;
  
  double maxxAbs = (std::max)(Cmaxx, std::fabs(Cminx));
  double maxyAbs = (std::max)(Cmaxy, std::fabs(Cminy));
  
  double maxda = (std::max)(maxxAbs, maxyAbs);
  int maxi = std::numeric_limits<int>::max();
  
  if(maxda < 1){
  	maxda = 1;
  }
  
  // why 0.1? dunno. it doesn't screw up with 0.1
  inputscale = (0.1f * (double)(maxi)) / maxda;
  
  //double scale = 1000;
  len = A->Length();
  
  for (unsigned int i = 0; i < len; i++) {
    Local<Object> obj = Local<Object>::Cast(A->Get(i));
    int x = (int)(inputscale * (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
    int y = (int)(inputscale * (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
        
    pts.push_back(point(x, y));
  }
  
  polygon poly;
  boost::polygon::set_points(poly, pts.begin(), pts.end());
  a+=poly;
  
  // subtract holes from a here...
  Handle<Array> holes = Handle<Array>::Cast(A->Get(String::NewFromUtf8(isolate,"children")));
  len = holes->Length();
  
  for(unsigned int i=0; i<len; i++){
    Handle<Array> hole = Handle<Array>::Cast(holes->Get(i));
    pts.clear();
    unsigned int hlen = hole->Length();
    for(unsigned int j=0; j<hlen; j++){
    	Local<Object> obj = Local<Object>::Cast(hole->Get(j));
    	int x = (int)(inputscale * (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
    	int y = (int)(inputscale * (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
    	pts.push_back(point(x, y));
    }
    boost::polygon::set_points(poly, pts.begin(), pts.end());
    a -= poly;
  }
  
  //and then load points B
  pts.clear();
  len = B->Length();
  
  //javascript nfps are referenced with respect to the first point
  double xshift = 0;
  double yshift = 0;
  
  for (unsigned int i = 0; i < len; i++) {
    Local<Object> obj = Local<Object>::Cast(B->Get(i));
    int x = -(int)(inputscale * (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue());
    int y = -(int)(inputscale * (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue());
    pts.push_back(point(x, y));
    
    if(i==0){
    	xshift = (double)obj->Get(String::NewFromUtf8(isolate,"x"))->NumberValue();
    	yshift = (double)obj->Get(String::NewFromUtf8(isolate,"y"))->NumberValue();
    }
  }
  
  boost::polygon::set_points(poly, pts.begin(), pts.end());
  b+=poly;
  
  polys.clear();
  
  convolve_two_polygon_sets(c, a, b);
  c.get(polys);
  
  Local<Array> result_list = Array::New(isolate);
  
  for(unsigned int i = 0; i < polys.size(); ++i ){
      
  	Local<Array> pointlist = Array::New(isolate);
  	int j = 0;
  	  	
  	for(polygon_traits<polygon>::iterator_type itr = polys[i].begin(); itr != polys[i].end(); ++itr) {
  	   Local<Object> p = Object::New(isolate);
  	 //  std::cout << (double)(*itr).get(boost::polygon::HORIZONTAL) / inputscale << std::endl;
       p->Set(String::NewFromUtf8(isolate, "x"), v8::Number::New(isolate, ((double)(*itr).get(boost::polygon::HORIZONTAL)) / inputscale + xshift));
       p->Set(String::NewFromUtf8(isolate, "y"), v8::Number::New(isolate, ((double)(*itr).get(boost::polygon::VERTICAL)) / inputscale + yshift));
       
       pointlist->Set(j, p);
       j++;
    }
    
    // holes
    Local<Array> children = Array::New(isolate);
    int k = 0;
    for(polygon_with_holes_traits<polygon>::iterator_holes_type itrh = begin_holes(polys[i]); itrh != end_holes(polys[i]); ++itrh){
    	Local<Array> child = Array::New(isolate);
    	int z = 0;
    	for(polygon_traits<polygon>::iterator_type itr2 = (*itrh).begin(); itr2 != (*itrh).end(); ++itr2) {
    		Local<Object> c = Object::New(isolate);
    		c->Set(String::NewFromUtf8(isolate, "x"), v8::Number::New(isolate, ((double)(*itr2).get(boost::polygon::HORIZONTAL)) / inputscale + xshift));
    		c->Set(String::NewFromUtf8(isolate, "y"), v8::Number::New(isolate, ((double)(*itr2).get(boost::polygon::VERTICAL)) / inputscale + yshift));
    		
    		child->Set(z, c);
    		z++;
    	}
    	children->Set(k, child);
    	k++;
    }
    
    pointlist->Set(String::NewFromUtf8(isolate, "children"), children);
    
    result_list->Set(i, pointlist);
  }
  
  //std::string text = buffer.str();
  
  info.GetReturnValue().Set(result_list);  
}
