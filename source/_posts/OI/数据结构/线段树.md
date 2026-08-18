---
title: 线段树
date: 2023-03-01 12:00:00
categories: 
- OI
- 数据结构
cover: assets/004.jpg
description: 维护区间信息的数据结构，支持单点/区间修改与区间查询，通过懒惰标记实现区间加、区间乘、区间求和。
math: true
mermaid: true
---

线段树是用来==维护区间信息==的数据结构。

线段树可在 $O(\log n)$ 的时间复杂度内实现：
**单点修改**、**区间修改**（区间加、区间乘、区间赋值等）、**区间查询**（区间求和、区间最值等）等操作。

线段树**将每个长度不为 $1$ 的区间划分成左右两个区间递归求解，把整个线段划分为一个树形结构，通过合并左右两区间信息来求得该区间的信息**。这样可方便进行大部分的区间操作。

## 建树
设线段树的根节点编号为 $1$ ，用数组 $d$ 来保存我们的线段树， $d_i$ 用来保存线段树上编号为  $i$ 的节点的值（这里每个节点所维护的值就是这个节点所表示的区间总和）。

**$d_i$ 的左儿子节点就是 $d_{2\times i}$，右儿子节点就是 $d_{2\times i+1}$ 。如果 $d_i$ 表示的是区间 $[s, t]$ 的话，其左儿子节点表示的是区间 $[s, \cfrac{s+t}{2}]$ ，右儿子表示的是区间 $[\cfrac{s+t}{2}, t]$**。

在实现时用递归建树。设当前的根节点为 $p$ ，则：

1. **如果根节点管辖的区间长度已经是 $1$ ，可直接根据 $a$ 数组上相应位置的值初始化该节点。**
2. **否则将该区间从中点处分割为两个子区间，分别进入左右子节点递归建树，最后合并两个子节点的信息。**

## 区间查询
如果要查询的区间是 $[l, r]$ ，则可以将其**拆**成最多为 $\log n$ 个**极大**的区间，合并这些区间即可求出 $[l, r]$ 的答案。

递归查询时，设 $[s, t]$ 为当前节点包含的区间,  $i$ 为当前节点的编号，则：

1. **当前区间为询问区间的子集时直接返回当前区间的和。**
2. **如果左儿子代表的区间 $[s, mid]$ 与询问区间有交集, 则递归查询左儿子。**
3. **如果右儿子代表的区间 $[mid + 1, t]$ 与询问区间有交集, 则递归查询右儿子。**

## 区间修改与懒惰标记
如果要求修改区间 $[l, r]$ ，把所有包含在区间 $[l, r]$ 中的节点都遍历、修改一次，时间复杂度无法承受。

==「懒惰标记」==就是通过延迟对节点信息的更改，从而减少可能不必要的操作次数。每次执行修改时，**通过打标记的方法表明该节点对应的区间在某一次操作中被更改，但不更新该节点的子节点的信息。实质性的修改则在下一次访问带有标记的节点时才进行**。

实现中修改与查询时：

1. **当前区间为修改区间的子集时直接修改当前节点的值，然后打标记，结束修改。**
2. **如果当前节点的懒惰标记非空，则更新当前节点两个子节点的值和懒惰标记值，然后将标记下传给子节点并清空当前节点的标记。**

## 实现

**区间加、区间乘、区间求和 $Code:$**
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const ll N = 1e6 + 5, M = 4e6 + 5;
int n, m;
ll a[N], d[M], mult[M], add[M];  // a:原数组 d:线段树 mult:乘法懒惰标记 add:加法懒惰标记 

ll Read()  // 快读 
{
	ll x = 0; bool s = 0; char c = getchar();
	while(c < '0' || c > '9') {if(c=='-') s = 1; c = getchar();}
	while('0' <= c && c <= '9') {x = (x << 3) + (x << 1) + (c ^ 48); c = getchar();}
	return s ? -x : x;
}

void Up(int i) {d[i] = (d[(i << 1)] + d[(i << 1) | 1]);}  // 计算节点 i 的区间和 

void Push_down(int i, int s, int t)  // 懒惰标记的维护 
{
	int l = (i << 1), r = (i << 1) | 1, mid = (s + t) >> 1;
	// 子节点的值 = 子节点的值 * 父节点乘法标记 + 子节点区间长度 * 父节点加法标记 
	if(mult[i] != 1)  // 按先乘后加的优先级维护 
	{
		mult[l] *= mult[i]; mult[r] *= mult[i];
		add[l] *= mult[i]; add[r] *= mult[i];
		d[l] *= mult[i]; d[r] *= mult[i];
		mult[i] = 1;  // 清除标记 
	}
	if(add[i])  // 加减 0 不改变结果，所以这里以标记值是否为 0 判断是否有标记
	{
		d[l] += add[i] * (mid - s + 1);
		d[r] += add[i] * (t - mid);
		add[l] += add[i]; add[r] += add[i];
		add[i] = 0;  // 清除标记 
	}
	return;
}

void Build(int s, int t, int i)  // 建树  s:区间左端点 t:区间右端点 i:节点标号
{
	mult[i] = 1; 
	if(s == t) {d[i] = a[s]; return;}  // 将节点赋值
	int mid = s + ((t - s) >> 1);
	Build(s, mid, i << 1);  // 建立左子树
	Build(mid + 1, t, (i << 1) | 1);  // 建立右子树
	Up(i);
}

void Mult(int l, int r, int s, int t, int i, ll v)  // 区间乘  l:操作区间左端点 r:操作区间右端点 s:所在区间左端点 t:所在区间右端点 i:节点标号 
{
	int mid = s + ((t - s) >> 1);
	if(l <= s && t <= r)
	{
		mult[i] *= v; add[i] *= v; d[i] *= v;
		return;
	}
	Push_down(i, s, t);
	if(mid >= l) Mult(l, r, s, mid, (i << 1), v);  // 更新 i * 2 的节点
	if(mid + 1 <= r) Mult(l, r, mid + 1, t, (i << 1) | 1, v);  // 更新 i * 2 + 1 的节点
	Up(i);
}

void Add(int l, int r, int s, int t, int i, ll v)  // 区间加  l:操作区间左端点 r:操作区间右端点 s:所在区间左端点 t:所在区间右端点 i:节点标号 
{
	int mid = s + ((t - s) >> 1);
	if(l <= s && t <= r)
	{
		d[i] += v * (t - s + 1);
		add[i] += v;
		return;
	}
	Push_down(i, s, t);
	if(mid >= l) Add(l, r, s, mid, (i << 1), v);  // 更新 i * 2 的节点
	if(mid + 1 <= r) Add(l, r, mid + 1, t, (i << 1) | 1, v);  // 更新 i * 2 + 1 的节点
	Up(i);
}

ll Get_sum(int l, int r, int s, int t, int i)  // 区间求和  l:求和区间左端点 r:求和区间右端点 s:所在区间左端点 t:所在区间右端点 i:节点标号 
{
	int mid = s + ((t - s) >> 1); ll sum = 0;
	if(l <= s && t <= r) return d[i];
	Push_down(i, s, t);
	if(mid >= l) sum += Get_sum(l, r, s, mid, (i << 1));  //更新 i * 2 的答案 
	if(mid + 1 <= r) sum += Get_sum(l, r, mid + 1, t, (i << 1) | 1);  //更新 i * 2 + 1 的答案 
	return sum;
}

int main()
{
	int op, l, r; ll v;  // op:操作类型 l:操作区间左端点 r:操作区间右端点 v:修改值 
	n = Read(), m = Read();
	for(int i = 1; i <= n; i++) a[i] = Read();  // 输入原数组 
	Build(1, n, 1);  // 建树 
	for(int i = 1; i <= m; i++)
	{
		op = Read();
		if(op == 1)  // 区间乘
		{
			l = Read(), r = Read(), v = Read();
			Mult(l, r, 1, n, 1, v);
		}
		else if(op == 2) // 区间加
		{
			l = Read(), r = Read(), v = Read();
			Add(l, r, 1, n, 1, v);
		}
		else if(op == 3)  // 区间求和
		{
			l = Read(), r = Read();
			printf("%lld\n", Get_sum(l, r, 1, n, 1));
		}
	}
	return 0;
}
```