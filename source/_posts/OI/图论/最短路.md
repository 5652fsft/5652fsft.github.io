---
title: 最短路
date: 2023-03-01 12:00:00
categories: 
- OI
- 图论
cover: assets/005.jpg
description: 最短路问题定义，以及 Floyd、Dijkstra、SPFA 三种算法的原理、适用场景与时间复杂度对比。
math: true
mermaid: true
---

# 定义及性质

对于边权为正的图，任意两个结点之间的最短路，不会经过重复的结点或边，经过的结点数不会超过 $n$ ，经过的边数不会超过 $n-1$ 。

# 算法实现

|               |Floyd          |Dijkstra       |SPFA           |
| :------------ | :------------ | :------------ | :------------ |
|最短路类型      |多源汇最短路    |单源最短路      |单源最短路      |
|作用于          |任意图         |非负权图        |任意图          |
|能否检测负环    |能             |不能            |能             |
|推荐作用图的大小 |小            |大、中           |中、小         |
|时间复杂度      |$O(n^3)$       |$O(m\log m)$   |$O(mn)$        |

## Floyd 算法
用于求**多源汇最短路**（任意两个结点之间的最短路）。

复杂度较高，适用于任何图，不管有向无向，边权正负，但是最短路必须存在，不能有负环。

### 实现
定义数组 `f[k][i][j]` 表示只允许经过结点 $1$ 到 $k$ （注意 $x$ 与 $y$ 不一定在其中）结点 $i$ 到 $j$ 的最短路长度。

则 `f[n][i][j]` 就是结点 $i$ 到结点 $j$ 的最短路长度。

`f[0][i][j]` 的值：
1. 当 $i$ 与 $j$ 间有直接相连的边的时候，为边权；
2. 当 $i=j$ 的时候为 $0$ ，因为到本身的距离为 $0$ ；
3. 当 $i$ 与 $j$ 没有直接相连的边时，为 $+\infty$ 。

`f[k][i][j] = min(f[k-1][i][j], f[k-1][i][k] + f[k-1][k][j])` ，

其中 `f[k-1][i][j]` 为不经过 $k$ 点的最短路，而  `f[k-1][i][k] + f[k-1][k][j]` 为经过了 $k$ 点的最短路。

这样，需依次增加问题规模（ $k$ 从 $1$ 到 $n$ ），判断任意两点在当前问题规模下的最短路。

> 如果放在一个给定第一维 $k$ 二维数组中，`f[i][k]` 与 `f[k][j]` 在某一行和某一列。而 `f[i][j]` 则是该行和该列的交叉点上的元素。
`f[k][i][j]` 的涵义是第一维为 $k-1$ 这一行和这一列的所有元素的最小值，包含 `f[k-1][i][j]`，那么在原地进行更改也不会改变最小值的值，因为如果将该三维矩阵压缩为二维，则所求结果 `f[i][j]` 一开始即为原 `f[k-1][i][j]` 的值，最后依然会成为该行和该列的最小值。

故第一维对结果无影响，数组的第一维是可省略，于是可改成 `f[i][j] = min(f[i][j], f[i][k] + f[k][j])` 。

**$Code:$**
```cpp
for(int i = 1; i <= n; i++)  // 初始化
{
	for(int j = 1; j <= n; j++)
	{
		if(i == j) f[i][j] = 0;  // 到本身的距离为零
		else f[i][j] = INF;  // 没有直接相连的边时，为无穷大
	}
}
for(int i = 1; i <= m; i++)  // 读入
{
	int u, v, w;
	scanf("%d%d%d", &u, &v, &w);
	f[u][v] = f[v][u] = min(f[u][v], w);  // 以双向边为例，同时考虑可能会重边恶心人
}
for(int k = 1; k <= n; k++)  // 核心部分
	for(int i = 1; i <= n; i++)
		for(int j = 1; j <= n; j++)
			f[i][j] = min(f[i][j], f[i][k] + f[k][j]);
```

## Dijkstra 算法
用于求解==非负权图==上**单源**最短路径。

### 实现
将结点分成两个集合：已确定最短路长度的点集 $S$ 集合的和未确定最短路长度的点集 $T$ 集合。开始所有点都属于 $T$ 集合。

开始时 $dis_s=0$ ，其他点的 $dis$ 均为 $+∞$。

然后重复这些操作：
1.  从 $T$ 集合中，选取一个最短路长度最小的结点，移到 $S$ 集合中。
2.  对那些刚刚被加入 $S$ 集合的结点的所有出边执行松弛操作。直到 $T$ 集合为空，算法结束。

即

1. 初始化 `dis[s] = 0` ，其余节点为正无穷（一般使用 `memset(dis, 0x3f, sizeof(dis))` ）。标记所有节点为未访问。
2. 找出所有未被访问的节点中， `dis[x]` 最小的节点 ，此时的 `dis[x]` 即为点到点的最短路长度。然后标记访问 。
3. 遍历点 的所有出边 ，若 `dis[x] + w < dis[v]` ，则以 `dis[x] + w` 更新 `dis[v]` 。
4. 重复步骤 ，直到所有点都被标记为已访问。

有多种方法来维护 $1$ 操作中最短路长度最小的结点，不同实现导致时间复杂度上的差异。本文的优先队列优化中，如果同一个点的最短路被更新多次，先前更新时插入的元素不能被删除和修改，故时间复杂度为 $O(m\log m)$ ，一般在**非负权稀疏图**上使用。

**$Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 50005;
int dis[N], n, m;
bool vis[N];
typedef pair <int, int> P;
vector <P> e[N];
priority_queue <P, vector<P>, greater<P> > que;

void Dijkstra(int s)
{
	memset(vis, 0, sizeof(vis));
	memset(dis, 0x3f, sizeof(dis));
	dis[s] = 0;
	
	que.push({0, s});
	while(!que.empty())
	{
		int u = que.top().second;
		que.pop();
		if(vis[u]) continue;
		vis[u] = 1;
		for(int i = 0; i < e[u].size(); i++)
		{
			int v = e[u][i].first, w = e[u][i].second;
			if(dis[v] > dis[u] + w)
			{
				dis[v] = dis[u] + w;
				que.push({dis[v], v});
			}
		}
	}
}

int main()
{
	int s, t, u, v, w;
	scanf("%d%d%d%d", &n, &m, &s, &t);  // 分别表示点的个数、边的条数、起点编号、终点编号
	for(int i = 1; i <= m; i++)
	{
		scanf("%d%d%d", &u, &v, &w);  // 编号为 u 和 v 的点之间有一条长度为 w 的无向边
		e[u].push_back({v, w});
		e[v].push_back({u, w});
	}
	Dijkstra(s);
	if(dis[t] == 0x3f)  // 不能到达
	{
		printf("impossible");
		return 0;
	}
	printf("%d", dis[t]);  // s 到 t 之间最短路的长度
	return 0;
}
```

## SPFA 算法
SPFA 算法是 Bellman-Ford 算法的队列优化，主要应用于**有负边权**时求**单源**最短路，可判断有没有负环产生。

**如果没有负边权，推荐使用 Dijkstra 算法。**

Bellman-Ford 算法不断尝试对图上每条边进行松弛，每进行一轮循环，就对图上所有边都尝试进行一次松弛操作，当一次循环中没有成功的松弛操作时，算法停止。在最短路存在的情况下，由于一次松弛操作会使最短路的边数至少 $+1$ ，而最短路的边数最多为 $n-1$ ，因此整个算法最多执行 $n-1$ 轮松弛操作。

但很多时候并不需要那么多无用的松弛操作。显然只有上一次被松弛的结点所连的边才有可能引起下一次松弛操作。 SPFA 用队列维护「哪些结点可能会引起松弛操作」，只访问必要的边。故 SPFA 一般情况下时间复杂度约为 $O(m)$ ，最坏情况下为 $O(mn)$ 。

如果从 $s$ 点出发，抵达一个负环时，松弛操作会无休止地进行下去。 SPFA 只需记录最短路经过了多少条边，当经过了至少 $n$ 条边时，说明 $s$ 点可以抵达一个负环。

### 实现
已知一个起点，以及点之间的距离，还需要定一个队列，在队列中存放后面可以用来进行松弛操作的点，数组 $cnt$ 表示某个点进入队列的次数。

从开始节点遍历边，当遍历到的点不在队列中的时候，将点放入队列， `cnt++` ，并且更新最短距离，当某一个节点进入队列次数大于 $n$ 的时候，就可以判定图中存在负环。

**$Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 50005;
int dis[N], cnt[N], n, m;
bool vis[N];
typedef pair <int, int> P;
vector <P> e[N];
queue <int> que;

bool SPFA(int s)
{
	memset(vis, 0, sizeof(vis));
	memset(cnt, 0, sizeof(cnt));
	memset(dis, 0x3f, sizeof(dis));
	dis[s] = 0; vis[s] = 1;
	
	que.push(s);
	while(!que.empty())
	{
		int u = que.front();
		que.pop();
		vis[u] = 0;
		for(int i = 0; i < e[u].size(); i++)
		{
			int v = e[u][i].first, w = e[u][i].second;
			if(dis[v] > dis[u] + w)
			{
				dis[v] = dis[u] + w;
				cnt[v] = cnt[u] + 1;
				if (cnt[v] >= n) return false;
				if(!vis[v])
				{
					vis[v] = 1;
					que.push(v);
				}
			}
		}
	}
	return true;
}

int main()
{
	int s, t, u, v, w;
	scanf("%d%d%d%d", &n, &m, &s, &t);  // 分别表示点的个数、边的条数、起点编号、终点编号
	for(int i = 1; i <= m; i++)
	{
		scanf("%d%d%d", &u, &v, &w);  // 编号为 u 和 v 的点之间有一条长度为 w 的无向边
		e[u].push_back({v, w});
		e[v].push_back({u, w});
	}
	if(!SPFA(s) || dis[t] == 0x3f)  // 有负环或不能到达
	{
		printf("impossible");
		return 0;
	}
	printf("%d", dis[t]);  // s 到 t 之间最短路的长度
	return 0;
}
```

# 各种问题变形
## 分层图最短路
若图中有些边是特殊边，这些特殊边只能走 $k$ 次，直接在图上跑无法判断特殊边用了多少次，且转移较麻烦。就有了**分层图**。

**例题 [洛谷 P4568 [JLOI2011] 飞行路线](https://www.luogu.com.cn/problem/P4568 "P4568 [JLOI2011] 飞行路线")**
> 题意概要：给定一个有 $n$ 个点、 $m$ 条无向边的图，每条边有一个边权，其中有 $k$ 次机会将一条普通边转化为一条边权为 $0$ 的特殊边，求 $s$ 到 $t$ 的最短路。

以下有**建多层图**和**状态转移**两种方法实现，代码均以例题为例。

### 建多层图
把原图建成 $k$ 层：
1. 非特殊边：直接在每层建立 $(u,v)$ 的边。
2. 特殊边：从 $i$ 层的 $u$ 到 $i+1$ 层的 $v$ 建立边。
3. 将每一层起点与起点、终点与终点依次连接边权为 $0$ 的边，防止转移失败。

最后第 $k$ 层终点的值即为答案。

**$Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 500005;
int dis[N], n, m, k;
bool vis[N];
typedef pair <int, int> P;
vector <P> e[N];
priority_queue <P, vector<P>, greater<P> > que;

void Dijkstra(int s)
{
	memset(vis, 0, sizeof(vis));
	memset(dis, 0x7f7f7f7f, sizeof(dis));
	dis[s] = 0;
	
	que.push({0, s});
	while(!que.empty())
	{
		int u = que.top().second;
		que.pop();
		if(vis[u]) continue;
		vis[u] = 1;
		for(int i = 0; i < e[u].size(); i++)
		{
			int v = e[u][i].first, w = e[u][i].second;
			if(dis[v] > dis[u] + w)
			{
				dis[v] = dis[u] + w;
				que.push({dis[v], v});
			}
		}
	}
}

int main()
{
	int s, t, u, v, w;
	scanf("%d%d%d", &n, &m, &k);
	scanf("%d%d", &s, &t);
	for(int i = 1; i <= m; i++)
	{
		scanf("%d%d%d", &u, &v, &w);
		e[u].push_back({v, w});
		e[v].push_back({u, w});
		for(int j = 1; j <= k; j++)
		{
			e[j * n + u].push_back({j * n + v, w});
			e[j * n + v].push_back({j * n + u, w});
			e[(j - 1) * n + u].push_back({j * n + v, 0});
			e[(j - 1) * n + v].push_back({j * n + u, 0});
		}
	}
	Dijkstra(s);
	int ans = 0x7f7f7f7f;
	for(int i = 0; i <= k; i++) ans = min(ans, dis[i * n + t]);
	printf("%d", ans);
	return 0;
}
```

### 状态转移
可以将 $dis$ 数组开成二维 `dis[i][j]` 表示到达 $i$ 号结点，用了 $j$ 次特殊边。

**$Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 50005;
int dis[N][15], n, m, k;
bool vis[N][15];
typedef pair <int, int> P;
struct edge
{
	int first, second, kk;
	bool operator <(const edge x) const {return first > x.first;}
};
vector <P> e[N];
priority_queue <edge> que;

void Dijkstra(int s)
{
	memset(vis, 0, sizeof(vis));
	memset(dis, 0x7f7f7f7f, sizeof(dis));
	dis[s][0] = 0;
	
	que.push({0, s, 0});
	while(!que.empty())
	{
		int u = que.top().second, kk = que.top().kk;
		que.pop();
		if(vis[u][kk]) continue;
		vis[u][kk] = 1;
		for(int i = 0; i < e[u].size(); i++)
		{
			int v = e[u][i].first, w = e[u][i].second;
			if(dis[v][kk] > dis[u][kk] + w)
			{
				dis[v][kk] = dis[u][kk] + w;
				que.push({dis[v][kk], v, kk});
			}
			if(kk + 1 <= k && dis[v][kk + 1] > dis[u][kk])
			{
				dis[v][kk + 1] = dis[u][kk];
				que.push({dis[v][kk + 1], v, kk + 1});
			}
		}
	}
}

int main()
{
	int s, t, u, v, w;
	scanf("%d%d%d", &n, &m, &k);
	scanf("%d%d", &s, &t);
	for(int i = 1; i <= m; i++)
	{
		scanf("%d%d%d", &u, &v, &w);
		e[u].push_back({v, w});
		e[v].push_back({u, w});
	}
	Dijkstra(s);
	int ans = 0x7f7f7f7f;
	for(int i = 0; i <= k; i++) ans = min(ans, dis[t][i]);
	printf("%d", ans);
	return 0;
}
```

## 差分约束
**差分约束系统**是一种特殊的 $n$ 元一次不等式组，包含 $n$ 个变量 $x_1,x_2,\dots,x_n$ 和 $m$ 个约束条件，每个约束条件由其中两个变量做差构成，形如 $x_i-x_j\le c_k$ ，其中 $1\le i,j\le n, i\ne j, 1\le k\le m$ 且 $c_k$ 为常数。

差分约束算法用于求一组满足系统中所有约束条件的解。

每个约束条件 $x_i-x_j\le c_k$ 可变形为单源最短路中的三角形不等式 $dis_v\le dis_u+w$ 的形式。故可将每个变量 $x_i$ 视为图中的一个结点，每个约束条件 $x_i-x_j\le c_k$ 视为结点 $j$ 向 $i$ 连有一条长为 $c_k$ 的有向边。

同理有
|约束条件         |转化                        |连边                                  |
|:-------------- |:-------------------------- |:------------------------------------ |
|$x_i-x_j\le c_k$|$x_i\le x_j+c_k$            |由 $j$ 向 $i$ 连一条长为 $c_k$ 的有向边 |
|$x_i-x_j\ge c_k$|$x_j\le x_i-c_k$            |由 $i$ 向 $j$ 连一条长为 $-c_k$ 的有向边|
|$x_i=x_j$       |$x_i-x_j\le 0,x_j- x_i\le 0$|$i,j$ 之间连一条长为 $0$ 的无向边       |

同时，对于该差分约束系统的任一组解，显然每个值加上同一个常数也是该差分约束系统的一组解（做差后常数被消掉）。

由于图可能不连通，要建一个虚拟源点 $0$ ，从这个虚拟源点向其他所有点都连一条长度为 $0$ 的边，以虚拟源点为起点，跑单源最短路，一般使用 SPFA 算法。

若图中无负环，则 $x_i=dis_i$ 为一组解。若图中有负环，则无解。

**$Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N = 10005;
int dis[N], cnt[N], n, m;
bool vis[N];
typedef pair <int, int> P;
vector <P> e[N];
queue <int> que;

bool SPFA(int s)
{
	memset(vis, 0, sizeof(vis));
	memset(cnt, 0, sizeof(cnt));
	memset(dis, 0x3f, sizeof(dis));
	dis[s] = 0; vis[s] = 1;
	
	que.push(s);
	while(!que.empty())
	{
		int u = que.front();
		que.pop();
		vis[u] = 0;
		for(int i = 0; i < e[u].size(); i++)
		{
			int v = e[u][i].first, w = e[u][i].second;
			if(dis[v] > dis[u] + w)
			{
				dis[v] = dis[u] + w;
				cnt[v] = cnt[u] + 1;
				if (cnt[v] >= n + 1) return false;
				if(!vis[v])
				{
					vis[v] = 1;
					que.push(v);
				}
			}
		}
	}
	return true;
}

int main()
{
	int u, v, w;
	scanf("%d%d", &n, &m);
	for(int i = 1; i <= m; i++)
	{
		scanf("%d%d%d", &u, &v, &w);
		e[v].push_back({u, w});
	}
	for(int i = 1; i <= n; i++) e[0].push_back({i, 0});
	if(!SPFA(0)) {printf("NO"); return 0;}
	for(int i = 1; i <= n; i++) printf("%d ", dis[i]);
	return 0;
}
```

## 最小环
图的最小环指图中至少由 $3$ 个点构成的边权和最小的环，其边权和也称围长。

### 暴力解法
设 $u,v$ 之间有一条边长为 $w$ 的边， $dis_{u,v}$ 表示删除 $u,v$ 之间的连边后， $u,v$ 之间的最短路。

那么中有向图中的最小环是 $dis_{v,u}+w$ ，无向图中 $u,v$ 可调换。

总时间复杂度 $O(n^2m)$ 。

### Dijkstra
枚举所有边，每一次求删除一条边之后对这条边的起点跑一次 Dijkstra ，道理同上。

时间复杂度 $O(m(n+m)\log n)$ 。

### Floyd
记原图中 $u,v$ 之间边的边权为 $mp_{u,v}$ 。

又 Floyd 算法有一性质：在最外层循环到点 $k$ 时（尚未开始第 $k$ 次循环），最短路数组 $f$ 中， $f_{u,v}$ 表示的是从 $u$ 到 $v$ 且仅经过编号在 $\left[1, k\right)$ 区间中的点的最短路。

由最小环的定义可知其至少有三个顶点，设其中编号最大的顶点为 $w$ ，环上与 $w$ 相邻两侧的两个点为 $u,v$ ，则在最外层循环枚举到 $k=w$ 时，该环的长度即为 $f_{u,v}+mp_{v,w}+mp_{w,u}$ 。

故在循环时对于每个 $k$ 枚举满足 $i<k,j<k$ 的 $(i,j)$ ，更新答案即可。

时间复杂度为 $O(n^3)$ 。

**无向图 $Code:$**
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const ll INF = 1e13, N = 105;
ll n, m, ans = INF, f[N][N], mp[N][N];

int main()
{
	scanf("%lld%lld", &n, &m);
	for(ll i = 1; i <= n; i++)
		for(ll j = 1; j <= n; j++)
			if(i != j) f[i][j] = mp[i][j] = INF;
	for(ll i = 1; i <= m; i++)
	{
		ll u, v, w;
		scanf("%lld%lld%lld", &u, &v, &w);
		f[u][v] = f[v][u] = min(f[u][v], w);
		mp[u][v] = mp[v][u] = min(mp[u][v], w);
	}
	for(ll k = 1; k <= n; k++)
	{
		for(ll i = 1; i < k; i++)
			for(ll j = i + 1; j < k; j++)
				ans = min(ans, f[i][j] + mp[i][k] + mp[k][j]);
		for(ll i = 1; i <= n; i++)
			for(ll j = 1; j <= n; j++)
				f[i][j] = f[j][i] = min(f[i][j], f[i][k] + f[k][j]);
	}
	if(ans == INF) printf("No solution.");
	else printf("%lld", ans);
	return 0;
}
```